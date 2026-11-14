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
import { optionalAuthenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply optional authentication so requests can authenticate via JWT or fallback gracefully in dev preview
router.use(optionalAuthenticateToken);

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
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

// 6. Curriculum & Subjects Management
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

export default router;
