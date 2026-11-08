import { Router } from 'express';
import {
  cancelSportsRegistration,
  createSportsDiscipline,
  createSportsEvent,
  createSportsFixture,
  createSportsTeam,
  createSportsTournament,
  deleteSportsEvent,
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
  updateSportsEvent,
  updateSportsFixture,
  updateSportsRegistrationStatus,
  updateSportsTeam,
  updateSportsTournament,
  verifySportsRegistration,
} from '../controllers/sports.controller';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/events', optionalAuthenticateToken, listSportsEvents);
router.post('/events', authenticateToken, createSportsEvent);
router.patch('/events/:id', authenticateToken, updateSportsEvent);
router.delete('/events/:id', authenticateToken, deleteSportsEvent);
router.delete('/events/:id/register', authenticateToken, cancelSportsRegistration);

router.get('/my-registrations', authenticateToken, getMySportsRegistrations);
router.get('/registrations/me', authenticateToken, getMySportsRegistrations);
router.get('/registrations', authenticateToken, listSportsRegistrations);
router.get('/registrations/verify', authenticateToken, verifySportsRegistration);
router.delete('/registrations/:id', authenticateToken, cancelSportsRegistration);
router.post('/registrations/championship', authenticateToken, registerChampionshipAthlete);
router.patch('/registrations/:registrationNumber/status', authenticateToken, updateSportsRegistrationStatus);
router.post('/register', authenticateToken, registerForSport);

router.get('/disciplines', optionalAuthenticateToken, listSportsDisciplines);
router.post('/disciplines', authenticateToken, createSportsDiscipline);
router.get('/teams', optionalAuthenticateToken, listSportsTeams);
router.post('/teams', authenticateToken, createSportsTeam);
router.patch('/teams/:id', authenticateToken, updateSportsTeam);
router.delete('/teams/:id', authenticateToken, deleteSportsTeam);
router.get('/tournaments', optionalAuthenticateToken, listSportsTournaments);
router.post('/tournaments', authenticateToken, createSportsTournament);
router.patch('/tournaments/:id', authenticateToken, updateSportsTournament);
router.delete('/tournaments/:id', authenticateToken, deleteSportsTournament);
router.get('/fixtures', optionalAuthenticateToken, listSportsFixtures);
router.post('/fixtures', authenticateToken, createSportsFixture);
router.patch('/fixtures/:id', authenticateToken, updateSportsFixture);
router.delete('/fixtures/:id', authenticateToken, deleteSportsFixture);
router.patch('/fixtures/:id/result', authenticateToken, recordSportsFixtureResult);
router.get('/standings', optionalAuthenticateToken, listSportsStandings);

export default router;
