import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SAAS_PLANS, SaasPlan, isSaasPlanId } from '../config/saasPlans';

const MAX_SLIP_CHARS = 1_500_000; // ~1.1MB image once base64-decoded

const DEFAULT_BANK_DETAILS = {
  bankName: process.env.SAAS_BANK_NAME || 'Commercial Bank of Ceylon',
  accountName: process.env.SAAS_BANK_ACCOUNT_NAME || 'Newtoz (Pvt) Ltd',
  accountNumber: process.env.SAAS_BANK_ACCOUNT_NUMBER || '8001234567',
  branch: process.env.SAAS_BANK_BRANCH || 'Colombo',
  branchCode: '',
};

const getSettings = (settings: unknown): Record<string, any> =>
  settings && typeof settings === 'object' && !Array.isArray(settings)
    ? { ...(settings as Record<string, any>) }
    : {};

const getPlatformBankDetails = async () => {
  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    select: { settings: true },
    orderBy: { createdAt: 'asc' },
  });
  for (const t of tenants) {
    const s = getSettings(t.settings);
    if (s.platformBankDetails && typeof s.platformBankDetails === 'object') {
      return {
        bankName: String(s.platformBankDetails.bankName || DEFAULT_BANK_DETAILS.bankName),
        accountName: String(s.platformBankDetails.accountName || DEFAULT_BANK_DETAILS.accountName),
        accountNumber: String(s.platformBankDetails.accountNumber || DEFAULT_BANK_DETAILS.accountNumber),
        branch: String(s.platformBankDetails.branch || DEFAULT_BANK_DETAILS.branch),
        branchCode: String(s.platformBankDetails.branchCode || ''),
      };
    }
  }
  return DEFAULT_BANK_DETAILS;
};

const countEnrolledStudents = async (tenantId: string): Promise<number> => {
  const rows = await prisma.enrollment.findMany({
    where: { course: { tenantId } },
    select: { studentId: true },
    distinct: ['studentId'],
  });
  return rows.length;
};

const studentLimitError = async (
  tenantId: string,
  plan: SaasPlan
): Promise<string | null> => {
  if (plan.studentLimit === null) return null;
  const enrolled = await countEnrolledStudents(tenantId);
  if (enrolled > plan.studentLimit) {
    return `You have ${enrolled} enrolled students. ${plan.name} allows up to ${plan.studentLimit}.`;
  }
  return null;
};

const stripSlip = (request: Record<string, any> | undefined) => {
  if (!request) return null;
  const { slipImage, ...rest } = request;
  return { ...rest, hasSlip: Boolean(slipImage) };
};

const buildSubscriptionPayload = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return null;

  const settings = getSettings(tenant.settings);
  const history = await prisma.tenantSubscription.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });
  const enrolledStudents = await countEnrolledStudents(tenantId);
  const bankDetails = await getPlatformBankDetails();

  // Never send the slip image or other admin-only data back in bulk
  const { pendingPlanRequest, ...publicSettings } = settings;

  return {
    tenant: { ...tenant, settings: publicSettings },
    plans: Object.values(SAAS_PLANS),
    enrolledStudents,
    bankDetails,
    pendingRequest: stripSlip(pendingPlanRequest),
    lastDecision: settings.lastPaymentDecision ?? null,
    history: history.map((h) => ({
      id: h.id,
      amount: Number(h.amount),
      currency: h.currency,
      billingCycle: h.billingCycle,
      status: h.status,
      startDate: h.startDate,
      endDate: h.endDate,
      createdAt: h.createdAt,
    })),
  };
};

// Activate a plan for a tenant: subscription record + plan/fee/features/renewal.
const activatePlan = async (
  tenantId: string,
  plan: SaasPlan,
  extraSettings: Record<string, any>
) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant not found');

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);
  const settings = getSettings(tenant.settings);
  const existingFeatures =
    settings.enabledFeatures && typeof settings.enabledFeatures === 'object'
      ? settings.enabledFeatures
      : {};
  const mergedFeatures = {
    ...plan.enabledFeatures,
    sub_tutor_saas_subscription: existingFeatures.sub_tutor_saas_subscription ?? true,
    sub_tutor_card_payment: existingFeatures.sub_tutor_card_payment ?? true,
    sub_tutor_bank_slip_payment: existingFeatures.sub_tutor_bank_slip_payment ?? true,
  };

  await prisma.$transaction([
    prisma.tenantSubscription.updateMany({
      where: { tenantId, status: 'ACTIVE' },
      data: { status: 'CANCELLED', endDate: now },
    }),
    prisma.tenantSubscription.create({
      data: {
        tenantId,
        amount: plan.monthlyFeeLkr,
        currency: 'LKR',
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        startDate: now,
        endDate,
      },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: plan.id,
        status: 'ACTIVE',
        settings: {
          ...settings,
          ...extraSettings,
          monthlyFeeLkr: plan.monthlyFeeLkr,
          enabledFeatures: mergedFeatures,
          renewalDate: endDate.toISOString().slice(0, 10),
        },
      },
    }),
  ]);
};

// ---------------------------------------------------------------- Tutor side

export const getMySubscription = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'No tenant linked to this account' });
      return;
    }

    const payload = await buildSubscriptionPayload(tenantId);
    if (!payload) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;
    }

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to load subscription' });
  }
};

export const submitPaymentRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'No tenant linked to this account' });
      return;
    }

    const requested =
      typeof req.body?.plan === 'string' ? req.body.plan.toUpperCase() : '';
    if (!isSaasPlanId(requested)) {
      res.status(400).json({ success: false, message: 'Invalid plan' });
      return;
    }
    const plan = SAAS_PLANS[requested];

    const paymentMethod =
      typeof req.body?.paymentMethod === 'string' &&
      req.body.paymentMethod.toUpperCase() === 'CARD'
        ? 'CARD'
        : 'BANK_SLIP';

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.deletedAt !== null) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;
    }

    if (tenant.plan.toUpperCase() === plan.id) {
      res.status(409).json({ success: false, message: 'You are already on this plan' });
      return;
    }

    const settings = getSettings(tenant.settings);
    if (settings.pendingPlanRequest && paymentMethod !== 'CARD') {
      res.status(409).json({
        success: false,
        message: 'You already have a payment awaiting approval. Cancel it first to submit a new one.',
      });
      return;
    }

    const limitError = await studentLimitError(tenantId, plan);
    if (limitError) {
      res.status(400).json({ success: false, message: limitError });
      return;
    }

    if (paymentMethod === 'CARD') {
      const rawCard = String(req.body?.cardNumber || '').replace(/\s+/g, '');
      if (!/^\d{15,19}$/.test(rawCard)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid 16-digit card number.',
        });
        return;
      }

      const cardExpiry = String(req.body?.cardExpiry || '').trim();
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid card expiry date (MM/YY).',
        });
        return;
      }

      const cardCvc = String(req.body?.cardCvc || '').trim();
      if (!/^\d{3,4}$/.test(cardCvc)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid 3 or 4-digit CVV/CVC code.',
        });
        return;
      }

      const last4 = rawCard.slice(-4);
      const receiptNo = `CARD-${last4}-${Date.now().toString().slice(-6)}`;
      const { pendingPlanRequest: _removed, ...settingsWithoutPending } = settings;

      await activatePlan(tenantId, plan, {
        ...settingsWithoutPending,
        lastPaymentDecision: {
          status: 'APPROVED',
          plan: plan.id,
          planName: plan.name,
          reference: receiptNo,
          paymentMethod: 'CARD',
          decidedAt: new Date().toISOString(),
        },
      });

      const payload = await buildSubscriptionPayload(tenantId);
      res.status(200).json({
        success: true,
        activatedImmediately: true,
        message: `Card payment successful (${receiptNo})! ${plan.name} is now active.`,
        data: payload,
      });
      return;
    }

    const reference =
      typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
    if (reference.length < 3 || reference.length > 60) {
      res.status(400).json({
        success: false,
        message: 'Enter the bank transfer reference number (3-60 characters)',
      });
      return;
    }

    const transferDateRaw =
      typeof req.body?.transferDate === 'string' ? req.body.transferDate : '';
    const transferDate = new Date(`${transferDateRaw}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(transferDateRaw) ||
      Number.isNaN(transferDate.getTime()) ||
      transferDate.getTime() > Date.now() + 24 * 60 * 60 * 1000
    ) {
      res.status(400).json({ success: false, message: 'Enter a valid transfer date' });
      return;
    }

    let slipImage: string | undefined;
    if (req.body?.slipImage !== undefined && req.body.slipImage !== null && req.body.slipImage !== '') {
      const slip = req.body.slipImage;
      if (
        typeof slip !== 'string' ||
        !/^data:image\/(jpeg|png|webp);base64,/.test(slip) ||
        slip.length > MAX_SLIP_CHARS
      ) {
        res.status(400).json({
          success: false,
          message: 'Slip must be a JPG, PNG or WebP image under 1 MB',
        });
        return;
      }
      slipImage = slip;
    }

    const note =
      typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 300) : '';

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          lastPaymentDecision: null,
          pendingPlanRequest: {
            plan: plan.id,
            planName: plan.name,
            amount: plan.monthlyFeeLkr,
            reference,
            transferDate: transferDateRaw,
            note,
            slipImage: slipImage ?? null,
            requestedAt: new Date().toISOString(),
            requestedBy: req.user?.email ?? null,
          },
        },
      },
    });

    const payload = await buildSubscriptionPayload(tenantId);
    res.status(201).json({
      success: true,
      message: 'Payment submitted. Your plan will activate once it is verified.',
      data: payload,
    });
  } catch (error) {
    console.error('Submit payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit payment' });
  }
};

export const cancelPaymentRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'No tenant linked to this account' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;
    }

    const { pendingPlanRequest, ...rest } = getSettings(tenant.settings);
    if (!pendingPlanRequest) {
      res.status(404).json({ success: false, message: 'No pending payment to cancel' });
      return;
    }

    await prisma.tenant.update({ where: { id: tenantId }, data: { settings: rest } });

    const payload = await buildSubscriptionPayload(tenantId);
    res.status(200).json({ success: true, message: 'Payment request cancelled', data: payload });
  } catch (error) {
    console.error('Cancel payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel payment request' });
  }
};

// --------------------------------------------------------- Super Admin side

export const listPaymentRequests = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { deletedAt: null },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    const requests = tenants
      .map((t) => {
        const settings = getSettings(t.settings);
        const request = settings.pendingPlanRequest;
        if (!request) return null;
        return {
          tenantId: t.id,
          tenantName: t.name,
          tenantCode: t.slug,
          currentPlan: t.plan,
          adminEmail: settings.adminEmail ?? '',
          ...request,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => String(b.requestedAt).localeCompare(String(a.requestedAt)));

    const completedPayments = tenants
      .flatMap((t) => {
        const settings = getSettings(t.settings);
        const lastDecision = settings.lastPaymentDecision;
        return (t.subscriptions || []).map((sub) => ({
          id: sub.id,
          tenantId: t.id,
          tenantName: t.name,
          tenantCode: t.slug,
          adminEmail: settings.adminEmail ?? '',
          plan: t.plan,
          planName:
            SAAS_PLANS[t.plan.toUpperCase() as keyof typeof SAAS_PLANS]?.name || t.plan,
          amount: Number(sub.amount),
          currency: sub.currency,
          status: sub.status,
          paymentMethod: lastDecision?.paymentMethod || 'BANK_SLIP',
          reference: lastDecision?.reference || `SUB-${sub.id.slice(0, 8).toUpperCase()}`,
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
        }));
      })
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const bankDetails = await getPlatformBankDetails();

    res.status(200).json({
      success: true,
      data: requests,
      completedPayments,
      bankDetails,
    });
  } catch (error) {
    console.error('List payment requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to load payment requests' });
  }
};

export const getBankDetails = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bankDetails = await getPlatformBankDetails();
    res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ success: false, message: 'Failed to load bank details' });
  }
};

export const updateBankDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bankName = typeof req.body?.bankName === 'string' ? req.body.bankName.trim() : '';
    const accountName = typeof req.body?.accountName === 'string' ? req.body.accountName.trim() : '';
    const accountNumber = typeof req.body?.accountNumber === 'string' ? req.body.accountNumber.trim() : '';
    const branch = typeof req.body?.branch === 'string' ? req.body.branch.trim() : '';
    const branchCode = typeof req.body?.branchCode === 'string' ? req.body.branchCode.trim() : '';

    if (!bankName || !accountName || !accountNumber || !branch) {
      res.status(400).json({
        success: false,
        message: 'Bank name, account holder name, account number, and branch are required.',
      });
      return;
    }

    const platformBankDetails = {
      bankName: bankName.slice(0, 120),
      accountName: accountName.slice(0, 120),
      accountNumber: accountNumber.slice(0, 60),
      branch: branch.slice(0, 120),
      branchCode: branchCode.slice(0, 40),
    };

    const tenants = await prisma.tenant.findMany({
      select: { id: true, settings: true },
    });

    await prisma.$transaction(
      tenants.map((t) =>
        prisma.tenant.update({
          where: { id: t.id },
          data: {
            settings: {
              ...getSettings(t.settings),
              platformBankDetails,
            },
          },
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Platform bank account details saved successfully.',
      data: platformBankDetails,
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({ success: false, message: 'Failed to save bank details' });
  }
};

export const decidePaymentRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.params.tenantId;
    const decision = req.body?.decision;
    if (typeof tenantId !== 'string' || !tenantId.trim()) {
      res.status(400).json({ success: false, message: 'Invalid tenant ID' });
      return;
    }
    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      res.status(400).json({ success: false, message: 'Decision must be APPROVE or REJECT' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.deletedAt !== null) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;
    }

    const settings = getSettings(tenant.settings);
    const request = settings.pendingPlanRequest;
    if (!request) {
      res.status(404).json({ success: false, message: 'No pending payment for this tenant' });
      return;
    }

    const { pendingPlanRequest: _removed, ...settingsWithoutPending } = settings;
    const decidedAt = new Date().toISOString();

    if (decision === 'REJECT') {
      const reason =
        typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 300) : '';
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settingsWithoutPending,
            lastPaymentDecision: {
              status: 'REJECTED',
              plan: request.plan,
              planName: request.planName,
              reason: reason || 'Payment could not be verified',
              decidedAt,
            },
          },
        },
      });
      res.status(200).json({ success: true, message: 'Payment rejected' });
      return;
    }

    const requestedPlanId: unknown = request.plan;
    if (!isSaasPlanId(requestedPlanId)) {
      res.status(400).json({ success: false, message: 'Request contains an invalid plan' });
      return;
    }
    const plan = SAAS_PLANS[requestedPlanId];

    const limitError = await studentLimitError(tenantId, plan);
    if (limitError) {
      res.status(400).json({ success: false, message: limitError });
      return;
    }

    await activatePlan(tenantId, plan, {
      ...settingsWithoutPending,
      lastPaymentDecision: {
        status: 'APPROVED',
        plan: plan.id,
        planName: plan.name,
        reference: request.reference,
        decidedAt,
      },
    });

    res.status(200).json({ success: true, message: `Approved. ${plan.name} is now active.` });
  } catch (error) {
    console.error('Decide payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment request' });
  }
};

export const getPlatformPaymentMethods = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { deletedAt: null },
      select: { settings: true },
      orderBy: { createdAt: 'asc' },
    });

    let paymentMethods = {
      enableCardPayment: true,
      enableBankSlip: true,
    };

    for (const t of tenants) {
      const s = getSettings(t.settings);
      if (s.platformPaymentMethods && typeof s.platformPaymentMethods === 'object') {
        paymentMethods = {
          enableCardPayment:
            typeof s.platformPaymentMethods.enableCardPayment === 'boolean'
              ? s.platformPaymentMethods.enableCardPayment
              : true,
          enableBankSlip:
            typeof s.platformPaymentMethods.enableBankSlip === 'boolean'
              ? s.platformPaymentMethods.enableBankSlip
              : true,
        };
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('Get platform payment methods error:', error);
    res.status(200).json({
      success: true,
      data: { enableCardPayment: true, enableBankSlip: true },
    });
  }
};

export const updatePlatformPaymentMethods = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { enableCardPayment, enableBankSlip } = req.body || {};

    const platformPaymentMethods = {
      enableCardPayment:
        typeof enableCardPayment === 'boolean' ? enableCardPayment : true,
      enableBankSlip:
        typeof enableBankSlip === 'boolean' ? enableBankSlip : true,
    };

    const tenants = await prisma.tenant.findMany({
      select: { id: true, settings: true },
    });

    if (tenants.length > 0) {
      await prisma.$transaction(
        tenants.map((t) => {
          const s = getSettings(t.settings);
          const currentFeatures =
            (s.enabledFeatures as Record<string, boolean>) || {};
          return prisma.tenant.update({
            where: { id: t.id },
            data: {
              settings: {
                ...s,
                platformPaymentMethods,
                enabledFeatures: {
                  ...currentFeatures,
                  sub_tuition_online_pay: platformPaymentMethods.enableCardPayment,
                  sub_tuition_slips: platformPaymentMethods.enableBankSlip,
                },
              },
            },
          });
        })
      );
    }

    res.status(200).json({
      success: true,
      message: 'Platform payment methods updated successfully.',
      data: platformPaymentMethods,
    });
  } catch (error) {
    console.error('Update platform payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform payment methods.',
    });
  }
};


