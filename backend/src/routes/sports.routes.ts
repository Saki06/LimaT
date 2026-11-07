import { Router } from 'express';
import {
  createSportsDiscipline,
  createSportsEvent,
  createSportsFixture,
  createSportsTeam,
  createSportsTournament,
  deleteSportsFixture,
  deleteSportsTeam,
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
  updateSportsFixture,
  updateSportsRegistrationStatus,
  updateSportsTeam,
  updateSportsTournament,
  verifySportsRegistration,
} from '../controllers/sports.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/events', authenticateToken, listSportsEvents);
router.post('/events', authenticateToken, createSportsEvent);

router.get('/my-registrations', authenticateToken, getMySportsRegistrations);
router.get('/registrations/me', authenticateToken, getMySportsRegistrations);
router.get('/registrations', authenticateToken, listSportsRegistrations);
router.get('/registrations/verify', authenticateToken, verifySportsRegistration);
router.post('/registrations/championship', authenticateToken, registerChampionshipAthlete);
router.patch('/registrations/:registrationNumber/status', authenticateToken, updateSportsRegistrationStatus);
router.post('/register', authenticateToken, registerForSport);

router.get('/disciplines', authenticateToken, listSportsDisciplines);
router.post('/disciplines', authenticateToken, createSportsDiscipline);
router.get('/teams', authenticateToken, listSportsTeams);
router.post('/teams', authenticateToken, createSportsTeam);
router.patch('/teams/:id', authenticateToken, updateSportsTeam);
router.delete('/teams/:id', authenticateToken, deleteSportsTeam);
router.get('/tournaments', authenticateToken, listSportsTournaments);
router.post('/tournaments', authenticateToken, createSportsTournament);
router.patch('/tournaments/:id', authenticateToken, updateSportsTournament);
router.delete('/tournaments/:id', authenticateToken, deleteSportsTournament);
router.get('/fixtures', authenticateToken, listSportsFixtures);
router.post('/fixtures', authenticateToken, createSportsFixture);
router.patch('/fixtures/:id', authenticateToken, updateSportsFixture);
router.delete('/fixtures/:id', authenticateToken, deleteSportsFixture);
router.patch('/fixtures/:id/result', authenticateToken, recordSportsFixtureResult);
router.get('/standings', authenticateToken, listSportsStandings);

export default router;
