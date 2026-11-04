import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
} from '../controllers/quiz.controller';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';

const router = Router();

// 1. List quizzes (Public + Students + Teachers)
router.get('/', optionalAuthenticateToken, getQuizzes);

// 2. Get specific quiz by ID
router.get('/:id', optionalAuthenticateToken, getQuizById);

// 3. Create a new quiz (Teachers & Admins only)
router.post('/', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createQuiz);

// 4. Update quiz (Teachers & Admins only)
router.put('/:id', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateQuiz);

// 5. Delete quiz (Teachers & Admins only)
router.delete('/:id', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteQuiz);

// 6. Submit student quiz attempt & auto-grade
router.post('/:id/attempt', authenticateToken, submitQuizAttempt);

export default router;
