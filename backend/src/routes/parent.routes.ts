import { Router } from 'express';
import {
  getMyChildren,
  getParentDashboardOverview,
  submitLeaveRequest,
  submitDepositSlip,
  getMyParentProfile,
  updateMyParentProfile,
  linkChildStudent,
} from '../controllers/parent.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All parent routes require authentication
router.use(authenticateToken);

// 0. Current Parent Profile
router.get('/me', getMyParentProfile);
router.put('/me', updateMyParentProfile);

// 1. Children profiles with live academic standing
router.get('/children', getMyChildren);
router.post('/link-child', linkChildStudent);

// 2. Parent Dashboard Cockpit
router.get('/dashboard', getParentDashboardOverview);

// 3. Leave application submission
router.post('/leave-request', submitLeaveRequest);

// 4. Bank deposit slip upload for tuition fee
router.post('/deposit-slip', submitDepositSlip);

export default router;
