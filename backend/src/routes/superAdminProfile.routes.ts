
import { Router } from 'express';
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from '../controllers/superAdminProfile.controller';
import {
  authenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';
import {
  getTenantStatistics,
  getMonthlySaasMrr,
  getStudentStatistics,
} from '../controllers/superAdminStatistics.controller';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('SUPER_ADMIN'));

router.get('/profile', getSuperAdminProfile);
router.patch('/profile', updateSuperAdminProfile);
router.get('/statistics/tenants', getTenantStatistics);
router.get('/statistics/mrr', getMonthlySaasMrr);
router.get('/statistics/students', getStudentStatistics);

export default router;
