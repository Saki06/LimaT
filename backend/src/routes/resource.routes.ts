import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  recordResourceView,
  recordResourceDownload,
} from '../controllers/resource.controller';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';

const router = Router();

// 1. List educational resources (Public + Subscribers-Only access control)
router.get('/', optionalAuthenticateToken, getResources);

// 2. Get specific resource details
router.get('/:id', optionalAuthenticateToken, getResourceById);

// 3. Create a new resource (Teacher / Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  createResource
);

// 4. Update resource (Teacher / Admin)
router.put(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  updateResource
);

// 5. Delete resource (Teacher / Admin)
router.delete(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  deleteResource
);

// 6. Record resource view
router.post('/:id/view', recordResourceView);

// 7. Record resource download
router.post('/:id/download', recordResourceDownload);

export default router;
