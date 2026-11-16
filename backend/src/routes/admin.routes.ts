import { Router } from 'express';
import {
  getAdminOverview,
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  getStudents,
  createStudent,
  updateStudentStatus,
  deleteUser,
  getSchoolSettings,
  updateSchoolSettings,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/admin.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Academic metadata is tenant-scoped and needed by student and teacher views.
router.get('/classes', getClasses);
router.get('/subjects', getSubjects);

router.use(requireRoles('ADMIN'));

// 1. Overview KPIs & Activity
router.get('/overview', getAdminOverview);

// 2. Staff Management (Teachers, Admins, Coaches)
router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.patch('/staff/:id/status', updateStaffStatus);

// 3. Student & Directory Management
router.get('/students', getStudents);
router.post('/students', createStudent);
router.patch('/students/:id/status', updateStudentStatus);
router.delete('/users/:id', deleteUser);

// 4. School Settings & Tenant Branding
router.get('/settings', getSchoolSettings);
router.put('/settings', updateSchoolSettings);

// 5. Classes & Academic Streams Management
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

// 6. Curriculum & Subjects Management
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

export default router;
