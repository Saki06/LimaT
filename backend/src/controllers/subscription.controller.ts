import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/prisma';
import { SAAS_PLANS, SaasPlan, SaasPlanId, isSaasPlanId } from '../config/saasPlans';

const MAX_SLIP_CHARS = 1_500_000;
const getSettings = (settings: unknown): Record<string, any> =>
  settings && typeof settings === 'object' && !Array.isArray(settings)
    ? { ...(settings as Record<string, any>) }
    : {};

const stripSlip = (request: Record<string, any> | undefined) => {
  if (!request) return null;
  const { slipImage, ...rest } = request;
  return { ...rest, hasSlip: Boolean(slipImage) };
};

const getPlatformBankDetails = async () => {
  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    select: { settings: true },
    orderBy: { createdAt: 'asc' },
  });
  for (const tenant of tenants) {
    const bank = getSettings(tenant.settings).platformBankDetails;
    if (bank && typeof bank === 'object') return bank;
  }
  return null;
};

const countEnrolledStudents = async (tenantId: string): Promise<number> => {
  const rows = await prisma.enrollment.findMany({
    where: { course: { tenantId } },
    select: { studentId: true },
    distinct: ['studentId'],
  });
  return rows.length;
};

const buildSubscriptionPayload = async (tenantId: string) => {
  const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, deletedAt: null } });
  if (!tenant) return null;
  const settings = getSettings(tenant.settings);
  const { pendingPlanRequest, ...publicSettings } = settings;
  const [history, enrolledStudents, bankDetails] = await Promise.all([
    prisma.tenantSubscription.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 12 }),
    countEnrolledStudents(tenantId),
    getPlatformBankDetails(),
  ]);
  return {
    tenant: { ...tenant, settings: publicSettings },
    plans: Object.values(SAAS_PLANS),
    enrolledStudents,
    bankDetails,
    pendingRequest: stripSlip(pendingPlanRequest),
    lastDecision: settings.lastPaymentDecision ?? null,
    history: history.map((item) => ({
      id: item.id,
      amount: Number(item.amount),
      currency: item.currency,
      billingCycle: item.billingCycle,
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
    })),
  };
};

const checkStudentLimit = async (tenantId: string, plan: SaasPlan): Promise<string | null> => {
  if (plan.studentLimit === null) return null;
  const count = await countEnrolledStudents(tenantId);
  return count > plan.studentLimit
    ? `You have ${count} enrolled students. ${plan.name} allows up to ${plan.studentLimit}.`
    : null;
};

const activatePlan = async (tenantId: string, plan: SaasPlan, lastDecision: Record<string, unknown>) => {
  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.findFirst({ where: { id: tenantId, deletedAt: null } });
    if (!tenant) throw new Error('Tenant not found');
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    const settings = getSettings(tenant.settings);
    const previous = settings.enabledFeatures && typeof settings.enabledFeatures === 'object'
      ? settings.enabledFeatures
      : {};
    const enabledFeatures = {
      ...plan.enabledFeatures,
      sub_tutor_saas_subscription: true,
      sub_tutor_card_payment: false,
      sub_tutor_bank_slip_payment: true,
    };
    await tx.tenantSubscription.updateMany({
      where: { tenantId, status: 'ACTIVE' },
      data: { status: 'CANCELLED', endDate: now },
    });
    await tx.tenantSubscription.create({
      data: {
        tenantId,
        amount: plan.monthlyFeeLkr,
        currency: 'LKR',
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        startDate: now,
        endDate,
      },
    });
    await tx.tenant.update({
      where: { id: tenantId },
      data: {
        plan: plan.id,
        status: 'ACTIVE',
        settings: {
          ...settings,
          ...lastDecision,
          monthlyFeeLkr: plan.monthlyFeeLkr,
          enabledFeatures: { ...previous, ...enabledFeatures },
          renewalDate: endDate.toISOString().slice(0, 10),
        },
      },
    });
  });
};

export const getMySubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(403).json({ success: false, message: 'No tenant linked to this account.' });
      return;
    }
    const payload = await buildSubscriptionPayload(tenantId);
    if (!payload) {
      res.status(404).json({ success: false, message: 'Tenant not found.' });
      return;
    }
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Get tenant subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to load subscription.' });
  }
};

export const submitPaymentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(403).json({ success: false, message: 'No tenant linked to this account.' });
      return;
    }
    if (String(req.body?.paymentMethod || 'BANK_SLIP').toUpperCase() === 'CARD') {
      res.status(503).json({ success: false, code: 'PAYMENT_PROVIDER_UNAVAILABLE', message: 'Card payments are unavailable until a verified payment provider is configured.' });
      return;
    }
    const requested = typeof req.body?.plan === 'string' ? req.body.plan.toUpperCase() : '';
    if (!isSaasPlanId(requested)) {
      res.status(400).json({ success: false, message: 'Invalid plan.' });
      return;
    }
    const plan = SAAS_PLANS[requested];
    const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, deletedAt: null, status: { notIn: ['SUSPENDED', 'INACTIVE'] } } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found or inactive.' });
      return;
    }
    if (tenant.plan.toUpperCase() === plan.id) {
      res.status(409).json({ success: false, message: 'This plan is already active.' });
      return;
    }
    const limitError = await checkStudentLimit(tenantId, plan);
    if (limitError) {
      res.status(400).json({ success: false, message: limitError });
      return;
    }
    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
    if (reference.length < 3 || reference.length > 60) {
      res.status(400).json({ success: false, message: 'Enter a valid bank transfer reference (3-60 characters).' });
      return;
    }
    const transferDateRaw = typeof req.body?.transferDate === 'string' ? req.body.transferDate : '';
    const transferDate = new Date(`${transferDateRaw}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDateRaw) || Number.isNaN(transferDate.getTime()) || transferDate.getTime() > Date.now() + 86_400_000) {
      res.status(400).json({ success: false, message: 'Enter a valid transfer date.' });
      return;
    }
    const slipImage = req.body?.slipImage;
    if (typeof slipImage !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(slipImage) || slipImage.length > MAX_SLIP_CHARS) {
      res.status(400).json({ success: false, message: 'Upload a JPG, PNG, or WebP bank slip under 1 MB.' });
      return;
    }
    const settings = getSettings(tenant.settings);
    if (settings.pendingPlanRequest) {
      res.status(409).json({ success: false, message: 'A payment request is already awaiting review.' });
      return;
    }
    const pendingPlanRequest = {
      plan: plan.id,
      planName: plan.name,
      amount: plan.monthlyFeeLkr,
      reference,
      transferDate: transferDateRaw,
      note: typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 300) : '',
      slipImage,
      requestedAt: new Date().toISOString(),
      requestedBy: req.user?.email ?? null,
    };
    await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { ...settings, pendingPlanRequest, lastPaymentDecision: null } } });
    const payload = await buildSubscriptionPayload(tenantId);
    res.status(202).json({ success: true, message: 'Bank slip submitted for Super Admin verification. Your plan remains unchanged until approved.', data: payload });
  } catch (error) {
    console.error('Submit tenant payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit payment request.' });
  }
};

export const cancelPaymentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(403).json({ success: false, message: 'No tenant linked to this account.' });
      return;
    }
    const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, deletedAt: null } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found.' });
      return;
    }
    const settings = getSettings(tenant.settings);
    if (!settings.pendingPlanRequest) {
      res.status(404).json({ success: false, message: 'No pending payment request.' });
      return;
    }
    const { pendingPlanRequest: _discarded, ...rest } = settings;
    await prisma.tenant.update({ where: { id: tenantId }, data: { settings: rest } });
    res.status(200).json({ success: true, message: 'Payment request cancelled.', data: await buildSubscriptionPayload(tenantId) });
  } catch (error) {
    console.error('Cancel tenant payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel payment request.' });
  }
};

export const listPaymentRequests = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({ where: { deletedAt: null }, include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 20 } } });
    const requests: Array<Record<string, any>> = tenants.flatMap((tenant) => {
      const settings = getSettings(tenant.settings);
      const request = settings.pendingPlanRequest;
      if (!request) return [];
      return [{ tenantId: tenant.id, tenantName: tenant.name, tenantCode: tenant.slug, currentPlan: tenant.plan, adminEmail: settings.adminEmail ?? '', ...stripSlip(request) }];
    }).sort((a, b) => String((b as Record<string, any>).requestedAt ?? '').localeCompare(String((a as Record<string, any>).requestedAt ?? '')));
    const completedPayments = tenants.flatMap((tenant) => tenant.subscriptions.map((subscription) => ({
      id: subscription.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantCode: tenant.slug,
      adminEmail: getSettings(tenant.settings).adminEmail ?? '',
      plan: tenant.plan,
      planName: SAAS_PLANS[tenant.plan.toUpperCase() as keyof typeof SAAS_PLANS]?.name || tenant.plan,
      amount: Number(subscription.amount),
      currency: subscription.currency,
      status: subscription.status,
      paymentMethod: 'BANK_SLIP',
      reference: getSettings(tenant.settings).lastPaymentDecision?.reference || '',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: subscription.createdAt,
    })));
    res.status(200).json({ success: true, data: requests, completedPayments, bankDetails: await getPlatformBankDetails() });
  } catch (error) {
    console.error('List tenant payment requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to load payment requests.' });
  }
};

export const getBankDetails = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: await getPlatformBankDetails() });
  } catch (error) {
    console.error('Get platform bank details error:', error);
    res.status(500).json({ success: false, message: 'Failed to load bank details.' });
  }
};

export const updateBankDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const platformBankDetails = {
      bankName: String(req.body?.bankName || '').trim().slice(0, 120),
      accountName: String(req.body?.accountName || '').trim().slice(0, 120),
      accountNumber: String(req.body?.accountNumber || '').trim().slice(0, 60),
      branch: String(req.body?.branch || '').trim().slice(0, 120),
      branchCode: String(req.body?.branchCode || '').trim().slice(0, 40),
    };
    if (!platformBankDetails.bankName || !platformBankDetails.accountName || !platformBankDetails.accountNumber || !platformBankDetails.branch) {
      res.status(400).json({ success: false, message: 'Bank name, account name, account number, and branch are required.' });
      return;
    }
    const tenants = await prisma.tenant.findMany({ select: { id: true, settings: true } });
    if (tenants.length === 0) {
      res.status(404).json({ success: false, message: 'No tenant settings are available.' });
      return;
    }
    await prisma.$transaction(tenants.map((tenant) => prisma.tenant.update({
      where: { id: tenant.id },
      data: { settings: { ...getSettings(tenant.settings), platformBankDetails } },
    })));
    res.status(200).json({ success: true, message: 'Platform bank account details saved.', data: platformBankDetails });
  } catch (error) {
    console.error('Update platform bank details error:', error);
    res.status(500).json({ success: false, message: 'Failed to save bank details.' });
  }
};

export const decidePaymentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = String(req.params.tenantId || '');
    const decision = req.body?.decision;
    if (!tenantId || (decision !== 'APPROVE' && decision !== 'REJECT')) {
      res.status(400).json({ success: false, message: 'A tenant ID and APPROVE or REJECT decision are required.' });
      return;
    }
    const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, deletedAt: null } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found.' });
      return;
    }
    const settings = getSettings(tenant.settings);
    const request = settings.pendingPlanRequest;
    if (!request || !isSaasPlanId(request.plan)) {
      res.status(404).json({ success: false, message: 'No valid pending payment request for this tenant.' });
      return;
    }
    const { pendingPlanRequest: _discarded, ...rest } = settings;
    const decidedAt = new Date().toISOString();
    if (decision === 'REJECT') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { settings: { ...rest, lastPaymentDecision: { status: 'REJECTED', plan: request.plan, reason: String(req.body?.reason || '').trim().slice(0, 300), decidedAt } } },
      });
      res.status(200).json({ success: true, message: 'Payment request rejected.' });
      return;
    }
    const plan = SAAS_PLANS[request.plan as SaasPlanId];
    const limitError = await checkStudentLimit(tenantId, plan);
    if (limitError) {
      res.status(400).json({ success: false, message: limitError });
      return;
    }
    await activatePlan(tenantId, plan, {
      ...rest,
      lastPaymentDecision: { status: 'APPROVED', plan: plan.id, planName: plan.name, reference: request.reference, paymentMethod: 'BANK_SLIP', decidedAt },
    });
    res.status(200).json({ success: true, message: `Bank slip approved. ${plan.name} is now active.` });
  } catch (error) {
    console.error('Decide tenant payment request error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment decision.' });
  }
};
