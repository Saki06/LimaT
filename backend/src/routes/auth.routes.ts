import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  registerStudent,
  registerTutor,
  registerParent,
  googleAuth,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Authentication Rate Limiters (VULN-06 fix)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  skipSuccessfulRequests: true, // Strictly limits failed login attempts without locking out legitimate sessions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts. Please try again after 15 minutes.',
  },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration requests from this IP. Please try again later.',
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/logout', authenticateToken, logout);
router.post('/google', loginLimiter, googleAuth);
router.post('/register/student', registerLimiter, registerStudent);
router.post('/register/tutor', registerLimiter, registerTutor);
router.post('/register/parent', registerLimiter, registerParent);

// Password Reset Routes
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-reset-code', otpVerifyLimiter, verifyResetCode);
router.post('/reset-password', otpVerifyLimiter, resetPassword);

export default router;
