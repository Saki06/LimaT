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
import {
  getRegistrationPayments,
  createPaymentRecord,
  submitPaymentWithSlip,
  listTenantPayments,
  approvePayment,
  rejectPayment,
  getPaymentReceipt,
} from '../controllers/sports-payment.controller';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  generateTeamJoinCode,
  sendTeamInvitation,
  acceptTeamInvitation,
  rejectTeamInvitation,
  getMyTeamMemberships,
  getMyTeamInvitations,
} from '../controllers/sports-team.controller';
import {
  getAthleteProfile,
  getMyAthleteProfile,
  upsertAthleteProfile,
  listAthletesByInterest,
  addAthleteAchievement,
  addParticipationRecord,
  getSportsLocations,
  seedSportsLocations,
} from '../controllers/sports-athlete.controller';
import {
  listFixtures,
  getFixtureById,
  createFixture,
  updateFixture,
  updateLiveScore,
  getLiveUpdates,
  completeFixture,
  getFixturesByDateRange,
  getUpcomingFixtures,
  getRecentlyCompletedFixtures,
} from '../controllers/sports-fixture.controller';
import {
  createBracket,
  getBracketById,
  getTournamentBrackets,
  addMatchToBracket,
  updateBracketMatchResult,
  progressWinnerToNextRound,
  getBracketResults,
  updateBracketStatus,
} from '../controllers/sports-bracket.controller';
import SportsNotificationController from '../controllers/sports-notification.controller';
import SportsNotificationServiceController from '../controllers/sports-notification-service.controller';
import SportsAnalyticsController from '../controllers/sports-analytics.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
const router = Router();
// Events
router.get('/events', authenticateToken, listSportsEvents);
router.post('/events', authenticateToken, createSportsEvent);
router.patch('/events/:id', authenticateToken, updateSportsEvent);
router.delete('/events/:id', authenticateToken, deleteSportsEvent);
router.delete('/events/:eventId/register', authenticateToken, cancelSportsRegistration);
// Registrations
router.get('/my-registrations', authenticateToken, getMySportsRegistrations);
router.get('/registrations/me', authenticateToken, getMySportsRegistrations);
router.get('/registrations', authenticateToken, listSportsRegistrations);
router.get('/registrations/verify', authenticateToken, verifySportsRegistration);
router.delete('/registrations/:registrationId', authenticateToken, cancelSportsRegistration);
router.post('/registrations/championship', authenticateToken, registerChampionshipAthlete);
router.patch('/registrations/:registrationNumber/status', authenticateToken, updateSportsRegistrationStatus);
router.post('/register', authenticateToken, registerForSport);
// Payments
router.get('/payments/:registrationId', authenticateToken, getRegistrationPayments);
router.post('/payments', authenticateToken, createPaymentRecord);
router.post('/payments/:paymentId/submit', authenticateToken, submitPaymentWithSlip);
router.get('/payments-admin/all', authenticateToken, listTenantPayments);
router.post('/payments/:paymentId/approve', authenticateToken, approvePayment);
router.post('/payments/:paymentId/reject', authenticateToken, rejectPayment);
router.get('/payments/:paymentId/receipt', authenticateToken, getPaymentReceipt);
// Disciplines
router.get('/disciplines', authenticateToken, listSportsDisciplines);
router.post('/disciplines', authenticateToken, createSportsDiscipline);
// Teams
router.get('/teams', authenticateToken, listSportsTeams);
router.post('/teams', authenticateToken, createSportsTeam);
router.patch('/teams/:id', authenticateToken, updateSportsTeam);
router.delete('/teams/:id', authenticateToken, deleteSportsTeam);
router.get('/teams/:teamId/members', authenticateToken, getTeamMembers);
router.post('/teams/:teamId/members', authenticateToken, addTeamMember);
router.patch('/teams/members/:memberId', authenticateToken, updateTeamMember);
router.delete('/teams/members/:memberId', authenticateToken, removeTeamMember);
router.post('/teams/:teamId/join-code', authenticateToken, generateTeamJoinCode);
router.post('/teams/:teamId/invite', authenticateToken, sendTeamInvitation);
router.post('/teams/invitations/accept', authenticateToken, acceptTeamInvitation);
router.post('/teams/invitations/reject', authenticateToken, rejectTeamInvitation);
router.get('/my-teams', authenticateToken, getMyTeamMemberships);
router.get('/my-team-invitations', authenticateToken, getMyTeamInvitations);
// Tournaments
router.get('/tournaments', authenticateToken, listSportsTournaments);
router.post('/tournaments', authenticateToken, createSportsTournament);
router.patch('/tournaments/:id', authenticateToken, updateSportsTournament);
router.delete('/tournaments/:id', authenticateToken, deleteSportsTournament);
// Fixtures (Phase 2)
router.get('/fixtures', authenticateToken, listFixtures);
router.post('/fixtures', authenticateToken, createFixture);
router.get('/fixtures/upcoming', authenticateToken, getUpcomingFixtures);
router.get('/fixtures/completed', authenticateToken, getRecentlyCompletedFixtures);
router.get('/fixtures/date-range', authenticateToken, getFixturesByDateRange);
router.get('/fixtures/:fixtureId', authenticateToken, getFixtureById);
router.patch('/fixtures/:fixtureId', authenticateToken, updateFixture);
router.delete('/fixtures/:id', authenticateToken, deleteSportsFixture);
router.post('/fixtures/:fixtureId/live-score', authenticateToken, updateLiveScore);
router.get('/fixtures/:fixtureId/live-updates', authenticateToken, getLiveUpdates);
router.post('/fixtures/:fixtureId/complete', authenticateToken, completeFixture);
// Brackets (Phase 2)
router.post('/brackets', authenticateToken, createBracket);
router.get('/brackets/:bracketId', authenticateToken, getBracketById);
router.get('/tournaments/:tournamentId/brackets', authenticateToken, getTournamentBrackets);
router.post('/brackets/:bracketId/matches', authenticateToken, addMatchToBracket);
router.patch('/brackets/matches/:matchId/result', authenticateToken, updateBracketMatchResult);
router.post('/brackets/matches/:matchId/progress', authenticateToken, progressWinnerToNextRound);
router.get('/brackets/:bracketId/results', authenticateToken, getBracketResults);
router.patch('/brackets/:bracketId/status', authenticateToken, updateBracketStatus);
// Old fixture endpoints (kept for backward compatibility)
router.get('/fixtures-old', authenticateToken, listSportsFixtures);
router.post('/fixtures-old', authenticateToken, createSportsFixture);
router.patch('/fixtures-old/:id', authenticateToken, updateSportsFixture);
router.delete('/fixtures-old/:id', authenticateToken, deleteSportsFixture);
router.patch('/fixtures-old/:id/result', authenticateToken, recordSportsFixtureResult);
router.get('/standings', authenticateToken, listSportsStandings);
// Athlete Profiles
router.get('/athletes/:userId/profile', authenticateToken, getAthleteProfile);
router.get('/athletes/profile/me', authenticateToken, getMyAthleteProfile);
router.put('/athletes/profile/me', authenticateToken, upsertAthleteProfile);
router.get('/athletes/interest/:sport', authenticateToken, listAthletesByInterest);
router.post('/athletes/profile/achievement', authenticateToken, addAthleteAchievement);
router.post('/athletes/profile/participation', authenticateToken, addParticipationRecord);
// Locations
router.get('/locations', authenticateToken, getSportsLocations);
router.post('/locations/seed', authenticateToken, seedSportsLocations);
// Phase 3: Notifications
router.get('/notifications', authenticateToken, (req, res, next) => SportsNotificationController.getUserNotifications(req, res, next));
router.patch('/notifications/:notificationId/read', authenticateToken, (req, res, next) => SportsNotificationController.markAsRead(req, res, next));
router.post('/notifications/mark-read', authenticateToken, (req, res, next) => SportsNotificationController.markMultipleAsRead(req, res, next));
router.delete('/notifications/:notificationId', authenticateToken, (req, res, next) => SportsNotificationController.deleteNotification(req, res, next));
router.get('/notifications/unread-count', authenticateToken, (req, res, next) => SportsNotificationController.getUnreadCount(req, res, next));
// Admin: Send notifications
router.post('/notifications/send', authenticateToken, (req, res, next) => SportsNotificationController.sendNotification(req, res, next));
router.post('/notifications/send-registration/:registrationId', authenticateToken, (req, res, next) => SportsNotificationController.sendRegistrationConfirmation(req, res, next));
router.post('/notifications/send-payment/:paymentId', authenticateToken, (req, res, next) => SportsNotificationController.sendPaymentStatusNotification(req, res, next));
router.post('/notifications/send-fixture/:fixtureId', authenticateToken, (req, res, next) => SportsNotificationController.sendFixtureNotification(req, res, next));
router.post('/notifications/send-result/:fixtureId', authenticateToken, (req, res, next) => SportsNotificationController.sendMatchResultNotification(req, res, next));
// Admin: Email service configuration
router.get('/notifications/email-services', authenticateToken, (req, res, next) => SportsNotificationServiceController.getEmailServices(req, res, next));
router.post('/notifications/email-services', authenticateToken, (req, res, next) => SportsNotificationServiceController.configureEmailService(req, res, next));
router.patch('/notifications/email-services/:serviceId/toggle', authenticateToken, (req, res, next) => SportsNotificationServiceController.toggleEmailService(req, res, next));
router.delete('/notifications/email-services/:serviceId', authenticateToken, (req, res, next) => SportsNotificationServiceController.deleteEmailService(req, res, next));
router.post('/notifications/email-services/:serviceId/test', authenticateToken, (req, res, next) => SportsNotificationServiceController.testEmailService(req, res, next));
// Admin: SMS service configuration
router.get('/notifications/sms-services', authenticateToken, (req, res, next) => SportsNotificationServiceController.getSMSServices(req, res, next));
router.post('/notifications/sms-services', authenticateToken, (req, res, next) => SportsNotificationServiceController.configureSMSService(req, res, next));
router.patch('/notifications/sms-services/:serviceId/toggle', authenticateToken, (req, res, next) => SportsNotificationServiceController.toggleSMSService(req, res, next));
router.delete('/notifications/sms-services/:serviceId', authenticateToken, (req, res, next) => SportsNotificationServiceController.deleteSMSService(req, res, next));
router.post('/notifications/sms-services/:serviceId/test', authenticateToken, (req, res, next) => SportsNotificationServiceController.testSMSService(req, res, next));
// Phase 4: Analytics Dashboard (Admin-only)
router.get('/analytics/summary', authenticateToken, (req, res, next) => SportsAnalyticsController.getDashboardSummary(req, res, next));
router.get('/analytics/registrations', authenticateToken, (req, res, next) => SportsAnalyticsController.getRegistrationAnalytics(req, res, next));
router.get('/analytics/payments', authenticateToken, (req, res, next) => SportsAnalyticsController.getPaymentAnalytics(req, res, next));
router.get('/analytics/fixtures', authenticateToken, (req, res, next) => SportsAnalyticsController.getFixtureAnalytics(req, res, next));
router.get('/analytics/teams', authenticateToken, (req, res, next) => SportsAnalyticsController.getTeamAnalytics(req, res, next));
router.get('/analytics/sports', authenticateToken, (req, res, next) => SportsAnalyticsController.getSportAnalytics(req, res, next));
router.get('/analytics/tournaments', authenticateToken, (req, res, next) => SportsAnalyticsController.getTournamentAnalytics(req, res, next));
router.get('/analytics/trends', authenticateToken, (req, res, next) => SportsAnalyticsController.getDateWiseAnalytics(req, res, next));
export default router;
