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
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/register/tutor', registerTutor);
router.post('/register/parent', registerParent);
router.post('/setup-token/validate', validateSetupToken);
router.post('/setup-password', setupPassword);

router.post('/change-password', authenticateToken, changePassword);
router.get('/session', authenticateToken, getSession);

export default router;
