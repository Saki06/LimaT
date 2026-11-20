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
} from '../controllers/subscription.controller';

const router = Router();
router.use(authenticateToken);

router.get('/me', requireRoles('TEACHER', 'ADMIN'), getMySubscription);
router.post('/me/payment-request', requireRoles('TEACHER', 'ADMIN'), submitPaymentRequest);
router.delete('/me/payment-request', requireRoles('TEACHER', 'ADMIN'), cancelPaymentRequest);

router.get('/requests', requireRoles('SUPER_ADMIN'), listPaymentRequests);
router.patch('/requests/:tenantId', requireRoles('SUPER_ADMIN'), decidePaymentRequest);
router.get('/bank-details', requireRoles('SUPER_ADMIN'), getBankDetails);
router.put('/bank-details', requireRoles('SUPER_ADMIN'), updateBankDetails);

export default router;
