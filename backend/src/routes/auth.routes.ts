import { Router } from 'express';
import {
  login,
  registerStudent,
  registerTutor,
  registerParent,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/register/tutor', registerTutor);
router.post('/register/parent', registerParent);

export default router;
