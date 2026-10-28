import { Router } from 'express';
import {
  listTenants,
  createTenant,
  updateTenantFeatures,
  updateTenant,
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

export default router;