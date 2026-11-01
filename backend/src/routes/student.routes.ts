import { Router } from 'express';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentDashboardOverview,
  getMyCourses,
  enrollInCourse,
  getMyPackages,
  subscribePackage,
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

// 3. Courses & Learning
router.get('/my-courses', getMyCourses);
router.post('/courses/:courseId/enroll', enrollInCourse);

// 4. Packages & Subscriptions
router.get('/my-packages', getMyPackages);
router.post('/packages/:packageId/subscribe', subscribePackage);

export default router;
