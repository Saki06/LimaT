import { Router } from 'express';
import {
   getMyTeacherProfile,
  updateMyTeacherProfile,
  getPublicTutorProfile,
  getTutorsMarketplace,
  getMyTeacherDashboard,
  getMyTeacherClasses,
  getMyTeacherSubjects,
} from '../controllers/teacher.controller';
import {
  authenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';

const router = Router();

// Public marketplace directory to search & filter tutors
router.get('/marketplace', getTutorsMarketplace);

// Public route to view tutor profile (for students & visitors)
router.get('/public/:slugOrId', getPublicTutorProfile);

// Protected routes (for the authenticated teacher)
router.get('/me/dashboard', authenticateToken, getMyTeacherDashboard);
router.get('/me', authenticateToken, getMyTeacherProfile);
router.put('/me', authenticateToken, updateMyTeacherProfile);

router.get(
  '/me/classes',
  authenticateToken,
  requireRoles('TEACHER'),
  getMyTeacherClasses
);

router.get(
  '/me/subjects',
  authenticateToken,
  requireRoles('TEACHER'),
  getMyTeacherSubjects
);
export default router;
