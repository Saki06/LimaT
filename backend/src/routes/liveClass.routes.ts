import { Router } from 'express';
import {
  createLiveClass,
  getLiveClasses,
  getLiveClassById,
  updateLiveClass,
  updateLiveClassStatus,
  deleteLiveClass,
  joinLiveClass,
} from '../controllers/liveClass.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// 1. List all live classes (Filtered by role / student access)
router.get('/', getLiveClasses);

// 2. Get specific live class
router.get('/:id', getLiveClassById);

// 3. Create a new live class (Teacher / Admin)
router.post('/', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createLiveClass);

// 4. Update live class session details
router.put('/:id', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateLiveClass);

// 5. Update status (Start / End live class)
router.patch('/:id/status', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateLiveClassStatus);

// 6. Delete a live class
router.delete('/:id', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteLiveClass);

// 7. Student Join Live Class & Record Attendance
router.post('/:id/join', joinLiveClass);

export default router;
