import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
} from '../controllers/assignment.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// All assignment routes require authentication
router.use(authenticateToken);

// 1. List assignments (Available for Teachers and Students)
router.get('/', getAssignments);

// 2. Get specific assignment by ID
router.get('/:id', getAssignmentById);

// 3. Create a new assignment (Teacher / Admin)
router.post('/', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createAssignment);

// 4. Update assignment (Teacher / Admin)
router.put('/:id', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateAssignment);

// 5. Delete assignment (Teacher / Admin)
router.delete('/:id', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteAssignment);

// 6. Student submit assignment
router.post('/:id/submit', submitAssignment);

// 7. Grade student submission (Teacher / Admin)
router.patch('/submissions/:submissionId/grade', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), gradeSubmission);

// 8. Get all submissions for an assignment (Teacher / Admin)
router.get('/:id/submissions', requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getAssignmentSubmissions);

export default router;
