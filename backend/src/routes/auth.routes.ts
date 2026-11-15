import { Router } from 'express';
import {
  login,
  registerStudent,
  registerTutor,
  registerParent,
  googleAuth,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/google', googleAuth);
router.post('/register/student', registerStudent);
router.post('/register/tutor', registerTutor);
router.post('/register/parent', registerParent);

export default router;
