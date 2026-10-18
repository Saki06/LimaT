import { Router } from 'express';
import { listSportsEvents, registerForSport } from '../controllers/sports.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/events', listSportsEvents);
router.post('/register', authenticateToken, registerForSport);

export default router;
