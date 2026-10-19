import { Router } from 'express';
import {
  createCourse,
  listCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// 1. Public / General Course Browsing
router.get('/', listCourses);

// 2. Tutor's Own Courses (Protected - TEACHER only)
router.get(
  '/my-courses',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  getMyCourses
);

// 3. Single Course View (Public)
router.get('/:id', getCourseById);

// 4. Create New Course / Subject (Protected - Tutor / Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  createCourse
);

// 5. Update Course / Syllabus (Protected - Owner or Admin)
router.put(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  updateCourse
);

// 6. Delete Course (Protected - Owner or Admin)
router.delete(
  '/:id',
  authenticateToken,
  requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  deleteCourse
);

export default router;
