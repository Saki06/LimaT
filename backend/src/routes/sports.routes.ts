import { Router } from 'express';
import {
  getMySportsRegistrations,
  listSportsEvents,
  registerForSport,
} from '../controllers/sports.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/events', authenticateToken, listSportsEvents);
router.get('/my-registrations', authenticateToken, getMySportsRegistrations);
router.post('/register', authenticateToken, registerForSport);

export default router;
