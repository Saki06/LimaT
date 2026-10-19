import { Router } from 'express';
import {
  createPackage,
  listPackages,
  getMyPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  subscribeToPackage,
  getPackageSubscribers,
} from '../controllers/package.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// 1. Public Package Catalog (Browse Plans)
router.get('/', listPackages);

// 2. Tutor's Own Created Packages
router.get(
  '/my-packages',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  getMyPackages
);

// 3. Single Package Details
router.get('/:id', getPackageById);

// 4. Create New Package (Tutor / Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  createPackage
);

// 5. Update Package
router.put(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  updatePackage
);

// 6. Delete / Archive Package
router.delete(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  deletePackage
);

// 7. Student Subscribe to Package
router.post(
  '/:id/subscribe',
  authenticateToken,
  subscribeToPackage
);

// 8. View Subscribers for a Package (Tutor / Admin)
router.get(
  '/:id/subscribers',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  getPackageSubscribers
);

export default router;
