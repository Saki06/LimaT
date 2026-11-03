
import { Router } from 'express';
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from '../controllers/superAdminProfile.controller';
import {
  authenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('SUPER_ADMIN'));

router.get('/profile', getSuperAdminProfile);
router.patch('/profile', updateSuperAdminProfile);

export default router;
