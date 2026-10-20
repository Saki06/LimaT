import { Router } from 'express';
import {
  getMyTeacherProfile,
  updateMyTeacherProfile,
  getPublicTutorProfile,
} from '../controllers/teacher.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public route to view tutor profile (for students & visitors)
router.get('/public/:slugOrId', getPublicTutorProfile);

// Protected routes (for the authenticated teacher)
router.get('/me', authenticateToken, getMyTeacherProfile);
router.put('/me', authenticateToken, updateMyTeacherProfile);

export default router;
