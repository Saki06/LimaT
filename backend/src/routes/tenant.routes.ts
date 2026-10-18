import { Router } from 'express';
import { listTenants, createTenant } from '../controllers/tenant.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public / Authenticated listing
router.get('/', listTenants);

// Protected: Super Admin only
router.post('/', authenticateToken, requireRoles('SUPER_ADMIN'), createTenant);

export default router;
