import { Router } from 'express';
import {
  login,
  registerStudent,
  registerTutor,
  registerParent,
  googleAuth,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/google', googleAuth);
router.post('/register/student', registerStudent);
router.post('/register/tutor', registerTutor);
router.post('/register/parent', registerParent);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;
