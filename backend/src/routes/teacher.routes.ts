import { Router } from 'express';
import {
  getMyTeacherProfile,
  updateMyTeacherProfile,
  getPublicTutorProfile,
  getTutorsMarketplace,
} from '../controllers/teacher.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public marketplace directory to search & filter tutors
router.get('/marketplace', getTutorsMarketplace);

// Public route to view tutor profile (for students & visitors)
router.get('/public/:slugOrId', getPublicTutorProfile);

// Protected routes (for the authenticated teacher)
router.get('/me', authenticateToken, getMyTeacherProfile);
router.put('/me', authenticateToken, updateMyTeacherProfile);

export default router;
