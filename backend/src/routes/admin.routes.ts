import { Router } from 'express';
import {
  getAdminOverview,
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  getStudents,
  updateStudentStatus,
  getSchoolSettings,
  updateSchoolSettings,
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
router.patch('/students/:id/status', updateStudentStatus);

// 4. School Settings & Tenant Branding
router.get('/settings', getSchoolSettings);
router.put('/settings', updateSchoolSettings);

export default router;
