import { Router } from 'express';
import {
  login,
  registerStudent,
  registerTutor,
  registerParent,
  changePassword,
  getSession,
  validateSetupToken,
  setupPassword,
  googleAuth,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/google', googleAuth);
router.post('/register/student', registerStudent);
router.post('/register/tutor', registerTutor);
router.post('/register/parent', registerParent);
router.post('/setup-token/validate', validateSetupToken);
router.post('/setup-password', setupPassword);

router.post('/change-password', authenticateToken, changePassword);
router.get('/session', authenticateToken, getSession);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;
