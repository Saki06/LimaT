import { Router } from 'express';
import {
  createSportsDiscipline,
  createSportsEvent,
  createSportsFixture,
  createSportsTeam,
  createSportsTournament,
  deleteSportsTournament,
  getMySportsRegistrations,
  listSportsDisciplines,
  listSportsEvents,
  listSportsFixtures,
  listSportsRegistrations,
  listSportsStandings,
  listSportsTeams,
  listSportsTournaments,
  recordSportsFixtureResult,
  registerChampionshipAthlete,
  registerForSport,
  updateSportsRegistrationStatus,
  updateSportsTournament,
} from '../controllers/sports.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/events', authenticateToken, listSportsEvents);
router.post('/events', authenticateToken, createSportsEvent);

router.get('/my-registrations', authenticateToken, getMySportsRegistrations);
router.get('/registrations/me', authenticateToken, getMySportsRegistrations);
router.get('/registrations', authenticateToken, listSportsRegistrations);
router.post('/registrations/championship', authenticateToken, registerChampionshipAthlete);
router.patch('/registrations/:registrationNumber/status', authenticateToken, updateSportsRegistrationStatus);
router.post('/register', authenticateToken, registerForSport);

router.get('/disciplines', authenticateToken, listSportsDisciplines);
router.post('/disciplines', authenticateToken, createSportsDiscipline);
router.get('/teams', authenticateToken, listSportsTeams);
router.post('/teams', authenticateToken, createSportsTeam);
router.get('/tournaments', authenticateToken, listSportsTournaments);
router.post('/tournaments', authenticateToken, createSportsTournament);
router.patch('/tournaments/:id', authenticateToken, updateSportsTournament);
router.delete('/tournaments/:id', authenticateToken, deleteSportsTournament);
router.get('/fixtures', authenticateToken, listSportsFixtures);
router.post('/fixtures', authenticateToken, createSportsFixture);
router.patch('/fixtures/:id/result', authenticateToken, recordSportsFixtureResult);
router.get('/standings', authenticateToken, listSportsStandings);

export default router;
