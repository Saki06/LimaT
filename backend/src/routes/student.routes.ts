import { Router } from 'express';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentDashboardOverview,
  getMyCourses,
  enrollInCourse,
  getMyPackages,
  subscribePackage,
  getMyPurchases,
  checkoutPackage,
  getMyAssignments,
  submitMyAssignment,
  getMyResults,
  getMyLiveClasses,
  joinMyLiveClass,
  getMyTimetable,
  getMyLibraryResources,
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

// 4. Packages & Subscriptions / Tuition Payments
router.get('/my-packages', getMyPackages);
router.post('/packages/:packageId/subscribe', subscribePackage);
router.post('/packages/:packageId/checkout', checkoutPackage);
router.get('/my-purchases', getMyPurchases);

// 5. Assignments & Homework Submissions
router.get('/my-assignments', getMyAssignments);
router.post('/assignments/:assignmentId/submit', submitMyAssignment);

// 6. Academic Results & Grades
router.get('/my-results', getMyResults);

// 7. Live Video Masterclasses & Attendance
router.get('/my-live-classes', getMyLiveClasses);
router.post('/live-classes/:sessionId/join', joinMyLiveClass);

// 8. Weekly Academic Timetable
router.get('/my-timetable', getMyTimetable);

// 9. Study Resources & Past Papers
router.get('/my-resources', getMyLibraryResources);

export default router;
