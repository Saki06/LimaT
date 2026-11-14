import { Router, Response, NextFunction } from 'express';
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
  optionalAuthenticateToken,
  requireRoles,
  AuthenticatedRequest,
} from '../middlewares/auth.middleware';

const router = Router();

// Middleware: Allow Super Admin, or allow preview in non-production
const requireSuperAdminOrDev = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  return requireRoles('SUPER_ADMIN')(req, res, next);
};

router.use(optionalAuthenticateToken);
router.use(requireSuperAdminOrDev);

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
