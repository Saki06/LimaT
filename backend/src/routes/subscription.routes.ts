import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';
import {
  getMySubscription,
  submitPaymentRequest,
  cancelPaymentRequest,
  listPaymentRequests,
  decidePaymentRequest,
  getBankDetails,
  updateBankDetails,
  getPlatformPaymentMethods,
  updatePlatformPaymentMethods,
} from '../controllers/subscription.controller';

const router = Router();

// Public: view active platform payment options (available to all students/visitors)
router.get('/payment-methods', getPlatformPaymentMethods);

router.use(authenticateToken);

// Tutor (self-service): view plan, submit / cancel a bank-transfer payment
router.get('/me', requireRoles('TEACHER', 'ADMIN'), getMySubscription);
router.post('/me/payment-request', requireRoles('TEACHER', 'ADMIN'), submitPaymentRequest);
router.delete('/me/payment-request', requireRoles('TEACHER', 'ADMIN'), cancelPaymentRequest);

// Super Admin: verify payments & manage platform bank account details & payment policies
router.get('/requests', requireRoles('SUPER_ADMIN'), listPaymentRequests);
router.patch('/requests/:tenantId', requireRoles('SUPER_ADMIN'), decidePaymentRequest);
router.get('/bank-details', requireRoles('SUPER_ADMIN'), getBankDetails);
router.put('/bank-details', requireRoles('SUPER_ADMIN'), updateBankDetails);
router.put('/payment-methods', requireRoles('SUPER_ADMIN'), updatePlatformPaymentMethods);

export default router;
