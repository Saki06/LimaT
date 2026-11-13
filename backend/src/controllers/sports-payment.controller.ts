import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const sportsManagerRoles = new Set(['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
const sportsAdminRoles = new Set(['ADMIN', 'SUPER_ADMIN']);

const getTenantId = (req: AuthenticatedRequest): string | null => req.user?.tenantId ?? null;

const requireSportsTenant = (req: AuthenticatedRequest, res: Response): string | null => {
  const tenantId = getTenantId(req);
  if (!req.user || !tenantId) {
    res.status(403).json({ success: false, message: 'A tenant account is required.' });
    return null;
  }
  return tenantId;
};

const requireSportsManager = (req: AuthenticatedRequest, res: Response): string | null => {
  if (!req.user || !sportsManagerRoles.has(req.user.role)) {
    res.status(403).json({ success: false, message: 'Sports management access is required.' });
    return null;
  }
  return requireSportsTenant(req, res);
};

const requireSportsAdmin = (req: AuthenticatedRequest, res: Response): string | null => {
  if (!req.user || !sportsAdminRoles.has(req.user.role)) {
    res.status(403).json({ success: false, message: 'Sports administration access is required.' });
    return null;
  }
  return requireSportsTenant(req, res);
};

/**
 * Get payment details for a specific registration
 */
export const getRegistrationPayments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const registrationId = typeof req.params.registrationId === 'string' ? req.params.registrationId : '';
    if (!registrationId) {
      res.status(400).json({ success: false, message: 'Registration ID is required.' });
      return;
    }

    const payments = await prisma.sportsRegistrationPayment.findMany({
      where: {
        registrationId,
        tenantId,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error: any) {
    console.error('Error fetching registration payments:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Create a payment record for a registration
 */
export const createPaymentRecord = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { registrationId, amount, currency, paymentMethod, bankRefNo, notes } = req.body;

    if (!registrationId || typeof registrationId !== 'string' || !registrationId.trim()) {
      res.status(400).json({ success: false, message: 'Registration ID is required.' });
      return;
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
      return;
    }

    // Verify registration exists and belongs to tenant
    const registration = await prisma.sportsRegistration.findFirst({
      where: {
        id: registrationId,
        event: { tenantId },
      },
    });

    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found.' });
      return;
    }

    // Check user is either the registrant or an admin
    if (user?.role === 'STUDENT' && registration.userId !== user.userId) {
      res.status(403).json({ success: false, message: 'You can only view your own payment records.' });
      return;
    }

    const payment = await prisma.sportsRegistrationPayment.create({
      data: {
        tenantId,
        registrationId,
        amount: new Prisma.Decimal(amount),
        currency: typeof currency === 'string' ? currency : 'LKR',
        paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : 'BANK_TRANSFER',
        bankRefNo: typeof bankRefNo === 'string' ? bankRefNo.trim() || null : null,
        notes: typeof notes === 'string' ? notes.trim() || null : null,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Error creating payment record:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Submit a payment with slip upload
 */
export const submitPaymentWithSlip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { paymentId } = req.params;
    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({ success: false, message: 'Payment ID is required.' });
      return;
    }

    const { bankRefNo, notes } = req.body;
    const slipUrl = (req as any).file?.filename || (req.body.slipUrl || null);
    const slipFileName = (req as any).file?.originalname || (req.body.slipFileName || null);

    if (!slipUrl) {
      res.status(400).json({ success: false, message: 'Payment slip is required.' });
      return;
    }

    // Verify payment exists
    const payment = await prisma.sportsRegistrationPayment.findFirst({
      where: { id: paymentId, tenantId },
      include: { registration: true },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    // Check user is either the registrant or an admin
    if (user?.role === 'STUDENT' && payment.registration.userId !== user.userId) {
      res.status(403).json({ success: false, message: 'You can only modify your own payment records.' });
      return;
    }

    const updated = await prisma.sportsRegistrationPayment.update({
      where: { id: paymentId },
      data: {
        paymentSlipUrl: slipUrl,
        paymentSlipFileName: typeof slipFileName === 'string' ? slipFileName : null,
        bankRefNo: typeof bankRefNo === 'string' ? bankRefNo.trim() || null : null,
        notes: typeof notes === 'string' ? notes.trim() || null : null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error submitting payment slip:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * List all payments for a tenant (admin only)
 */
export const listTenantPayments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number.parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.SportsRegistrationPaymentWhereInput = { tenantId };
    if (typeof status === 'string' && status.trim()) {
      where.status = status.trim() as any;
    }

    const [payments, total] = await Promise.all([
      prisma.sportsRegistrationPayment.findMany({
        where,
        include: {
          registration: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
              event: { select: { title: true, sportType: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.sportsRegistrationPayment.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error listing tenant payments:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Approve a payment (admin only)
 */
export const approvePayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const admin = req.user;
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { paymentId } = req.params;
    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({ success: false, message: 'Payment ID is required.' });
      return;
    }

    const { receiptNumber, notes } = req.body;

    const payment = await prisma.sportsRegistrationPayment.findFirst({
      where: { id: paymentId, tenantId },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    if (payment.status !== 'SUBMITTED') {
      res.status(409).json({
        success: false,
        message: `Payment cannot be approved from ${payment.status} status.`,
      });
      return;
    }

    const updated = await prisma.sportsRegistrationPayment.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        receiptNumber:
          typeof receiptNumber === 'string' && receiptNumber.trim() ? receiptNumber.trim() : null,
        notes: typeof notes === 'string' ? notes.trim() || null : null,
        approvedAt: new Date(),
        approvedBy: admin?.userId || 'system',
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Reject a payment (admin only)
 */
export const rejectPayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { paymentId } = req.params;
    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({ success: false, message: 'Payment ID is required.' });
      return;
    }

    const { rejectedReason } = req.body;
    if (!rejectedReason || typeof rejectedReason !== 'string' || !rejectedReason.trim()) {
      res.status(400).json({ success: false, message: 'Rejection reason is required.' });
      return;
    }

    const payment = await prisma.sportsRegistrationPayment.findFirst({
      where: { id: paymentId, tenantId },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    if (payment.status !== 'SUBMITTED') {
      res.status(409).json({
        success: false,
        message: `Payment cannot be rejected from ${payment.status} status.`,
      });
      return;
    }

    const updated = await prisma.sportsRegistrationPayment.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        rejectedReason: rejectedReason.trim(),
        rejectedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get payment receipt (admin or payment owner)
 */
export const getPaymentReceipt = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { paymentId } = req.params;
    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({ success: false, message: 'Payment ID is required.' });
      return;
    }

    const payment = await prisma.sportsRegistrationPayment.findFirst({
      where: { id: paymentId, tenantId },
      include: {
        registration: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    // Check authorization
    if (user?.role === 'STUDENT' && payment.registration.userId !== user.userId) {
      res.status(403).json({ success: false, message: 'Not authorized to view this receipt.' });
      return;
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: payment.receiptNumber || `RCP-${payment.id.substring(0, 8)}`,
      receiptDate: payment.approvedAt || new Date(),
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      bankRefNo: payment.bankRefNo,
      studentName: `${payment.registration.user.firstName} ${payment.registration.user.lastName}`,
      studentEmail: payment.registration.user.email,
      eventName: payment.registration.event.title,
      eventDate: payment.registration.event.startDate,
      eventVenue: payment.registration.event.venue,
    };

    res.status(200).json({ success: true, data: receiptData });
  } catch (error: any) {
    console.error('Error getting payment receipt:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
