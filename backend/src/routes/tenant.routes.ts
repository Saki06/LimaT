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

// Get all tenants
router.get(
  '/',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  listTenants
);

// Get archived tenants - Super Admin only
router.get(
  '/archived',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  listArchivedTenants
);

// Create tenant
router.post(
  '/',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  createTenant
);

// Update tenant features
router.patch(
  '/:id/features',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  updateTenantFeatures
);

// Update tenant details
router.patch(
  '/:id',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  updateTenant
);

// Archive tenant - Super Admin only
router.patch(
  '/:id/archive',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  archiveTenant
);

// Restore archived tenant - Super Admin only
router.patch(
  '/:id/restore',
  authenticateToken,
  requireRoles('SUPER_ADMIN'),
  restoreTenant
);
export default router;