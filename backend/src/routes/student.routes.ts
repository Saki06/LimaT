import { Router } from 'express';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentDashboardOverview,
} from '../controllers/student.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All student routes require authentication
router.use(authenticateToken);

// 1. Student Profile
router.get('/me', getMyStudentProfile);
router.put('/me', updateMyStudentProfile);

// 2. Student Dashboard Overview Cockpit (KPIs, Enrolled Courses, Upcoming Live, Pending Homework)
router.get('/dashboard', getStudentDashboardOverview);

export default router;
