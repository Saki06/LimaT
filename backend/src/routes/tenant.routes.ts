import { Router } from 'express';
import {
  listTenants,
  listArchivedTenants,
  createTenant,
  updateTenantFeatures,
  updateTenant,
  archiveTenant,
  restoreTenant
} from '../controllers/tenant.controller';

import {
  authenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';

const router = Router();

// Strict Super Admin authentication & role enforcement in all environments (VULN-04 fix)
router.use(authenticateToken);
router.use(requireRoles('SUPER_ADMIN'));

// 1. Get all active tenants
router.get('/', listTenants);

// 2. Get archived tenants - Super Admin only
router.get('/archived', listArchivedTenants);

// 3. Create new tenant
router.post('/', createTenant);

// 4. Update tenant features matrix
router.patch('/:id/features', updateTenantFeatures);

// 5. Update tenant details
router.patch('/:id', updateTenant);

// 6. Archive tenant
router.patch('/:id/archive', archiveTenant);

// 7. Restore archived tenant
router.patch('/:id/restore', restoreTenant);

export default router;
