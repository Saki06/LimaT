// @ts-nocheck
import { Response } from 'express';
import { Prisma, MatchStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const getTenantId = (req: AuthenticatedRequest): string | null => req.user?.tenantId ?? null;

const requireSportsTenant = (req: AuthenticatedRequest, res: Response): string | null => {
  const tenantId = getTenantId(req);
  if (!req.user || !tenantId) {
    res.status(403).json({ success: false, message: 'A tenant account is required.' });
    return null;
  }
  return tenantId;
};

const requireSportsAdmin = (req: AuthenticatedRequest, res: Response): string | null => {
  const tenantId = requireSportsTenant(req, res);
  if (!tenantId) return null;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role || '')) {
    res.status(403).json({ success: false, message: 'Admin access required.' });
    return null;
  }
  return tenantId;
};

// Helper to ensure value is string (handles arrays from form data)
const ensureString = (val: any): string | null => {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] || null;
  return String(val);
};

/**
 * Get all fixtures for a tenant with filters
 */
export const listFixtures = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { sportName, status, competitionName, tournamentId, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.SportsFixtureWhereInput = {
      tenantId,
      ...(sportName && { sportName: { contains: sportName as string, mode: 'insensitive' } }),
      ...(status && { status: status as MatchStatus }),
      ...(competitionName && { competitionName: { contains: competitionName as string, mode: 'insensitive' } }),
      ...(tournamentId && { tournamentId: tournamentId as string }),
    };

    const [fixtures, total] = await Promise.all([
      prisma.sportsFixture.findMany({
        where,
        include: { tournament: true },
        orderBy: { date: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.sportsFixture.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: fixtures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error listing fixtures:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get a single fixture with details
 */
export const getFixtureById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { fixtureId } = req.params;

    const fixture = await prisma.sportsFixture.findUnique({
      where: { id: fixtureId },
      include: {
        tournament: true,
        liveUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        bracketMatches: {
          include: { bracket: true },
        },
      },
    });

    if (!fixture || fixture.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Fixture not found.' });
      return;
    }

    res.status(200).json({ success: true, data: fixture });
  } catch (error: any) {
    console.error('Error fetching fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Create a new fixture
 */
export const createFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const {
      tournamentId,
      sportName,
      homeTeam,
      awayTeam,
      homeDistrict,
      awayDistrict,
      competitionName,
      roundName,
      date,
      time,
      venue,
    } = req.body;

    if (!sportName || !homeTeam || !awayTeam || !competitionName || !date || !venue) {
      res.status(400).json({
        success: false,
        message: 'sportName, homeTeam, awayTeam, competitionName, date, and venue are required.',
      });
      return;
    }

    const fixtureDate = new Date(date);
    if (Number.isNaN(fixtureDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date format.' });
      return;
    }

    const fixture = await prisma.sportsFixture.create({
      data: {
        tenantId,
        tournamentId,
        sportName: sportName.trim(),
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        homeDistrict: homeDistrict ? (homeDistrict as string).trim() : null,
        awayDistrict: awayDistrict ? (awayDistrict as string).trim() : null,
        competitionName: competitionName.trim(),
        roundName: roundName ? (roundName as string).trim() : null,
        date: fixtureDate,
        time: time || '00:00',
        venue: venue.trim(),
        status: 'UPCOMING',
      },
      include: { tournament: true },
    });

    res.status(201).json({ success: true, data: fixture });
  } catch (error: any) {
    console.error('Error creating fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Update fixture details (not live updates)
 */
export const updateFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { fixtureId } = req.params;
    const { roundName, date, time, venue, status } = req.body;

    const existing = await prisma.sportsFixture.findUnique({
      where: { id: fixtureId },
    });

    if (!existing || existing.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Fixture not found.' });
      return;
    }

    const data: any = {};
    if (roundName) data.roundName = (roundName as string).trim();
    if (date) {
      const dateObj = new Date(date);
      if (Number.isNaN(dateObj.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid date format.' });
        return;
      }
      data.date = dateObj;
    }
    if (time) data.time = time;
    if (venue) data.venue = (venue as string).trim();
    if (status && ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      data.status = status;
    }

    const updated = await prisma.sportsFixture.update({
      where: { id: fixtureId },
      data,
      include: { tournament: true },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Update live match score
 */
export const updateLiveScore = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { fixtureId } = req.params;
    const { homeScore, awayScore, period, periodTime, event, playerName, teamId } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      res.status(400).json({ success: false, message: 'homeScore and awayScore are required.' });
      return;
    }

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number' || homeScore < 0 || awayScore < 0) {
      res.status(400).json({ success: false, message: 'Scores must be non-negative numbers.' });
      return;
    }

    const fixture = await prisma.sportsFixture.findUnique({
      where: { id: fixtureId },
    });

    if (!fixture || fixture.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Fixture not found.' });
      return;
    }

    // Update fixture scores and status
    const updatedFixture = await prisma.sportsFixture.update({
      where: { id: fixtureId },
      data: {
        homeScore: homeScore.toString(),
        awayScore: awayScore.toString(),
        status: 'LIVE',
        recordedAt: new Date(),
      },
    });

    // Create live match update record
    const liveUpdate = await prisma.liveMatchUpdate.create({
      data: {
        tenantId,
        fixtureId,
        homeScore,
        awayScore,
        period: period || 1,
        periodTime: periodTime || null,
        event: event || null,
        playerName: playerName || null,
        teamId: teamId || null,
        updatedBy: req.user?.userId || 'SYSTEM',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        fixture: updatedFixture,
        liveUpdate,
      },
    });
  } catch (error: any) {
    console.error('Error updating live score:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get live updates for a fixture
 */
export const getLiveUpdates = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { fixtureId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string) || 50));

    const fixture = await prisma.sportsFixture.findUnique({
      where: { id: fixtureId },
    });

    if (!fixture || fixture.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Fixture not found.' });
      return;
    }

    const updates = await prisma.liveMatchUpdate.findMany({
      where: { fixtureId },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    res.status(200).json({
      success: true,
      data: updates.reverse(),
    });
  } catch (error: any) {
    console.error('Error fetching live updates:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Mark fixture as completed and record final score
 */
export const completeFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { fixtureId } = req.params;
    const { homeScore, awayScore, outcome, notes } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      res.status(400).json({ success: false, message: 'homeScore and awayScore are required.' });
      return;
    }

    const fixture = await prisma.sportsFixture.findUnique({
      where: { id: fixtureId },
    });

    if (!fixture || fixture.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Fixture not found.' });
      return;
    }

    let outcomeValue = outcome || 'DRAW';
    if (homeScore > awayScore) {
      outcomeValue = `${fixture.homeTeam} WON`;
    } else if (awayScore > homeScore) {
      outcomeValue = `${fixture.awayTeam} WON`;
    }

    const updated = await prisma.sportsFixture.update({
      where: { id: fixtureId },
      data: {
        homeScore: homeScore.toString(),
        awayScore: awayScore.toString(),
        outcome: outcomeValue,
        status: 'COMPLETED',
        recordedAt: new Date(),
      },
      include: { tournament: true, bracketMatches: true },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error completing fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get fixtures by calendar view (filtered by date range, sport, etc)
 */
export const getFixturesByDateRange = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { startDate, endDate, sportName, venue } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'startDate and endDate are required (ISO format).' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date format. Use ISO format (YYYY-MM-DD).' });
      return;
    }

    const where: Prisma.SportsFixtureWhereInput = {
      tenantId,
      date: {
        gte: start,
        lte: end,
      },
      ...(sportName && { sportName: { contains: sportName as string, mode: 'insensitive' } }),
      ...(venue && { venue: { contains: venue as string, mode: 'insensitive' } }),
    };

    const fixtures = await prisma.sportsFixture.findMany({
      where,
      include: { tournament: true },
      orderBy: { date: 'asc' },
    });

    // Group by date for calendar view
    const groupedByDate: Record<string, typeof fixtures> = {};
    fixtures.forEach((fixture) => {
      const dateStr = fixture.date.toISOString().split('T')[0];
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = [];
      }
      groupedByDate[dateStr].push(fixture);
    });

    res.status(200).json({
      success: true,
      data: {
        fixtures,
        groupedByDate,
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching fixtures by date range:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get upcoming fixtures
 */
export const getUpcomingFixtures = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { limit = 20 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

    const fixtures = await prisma.sportsFixture.findMany({
      where: {
        tenantId,
        status: 'UPCOMING',
        date: {
          gte: new Date(),
        },
      },
      include: { tournament: true },
      orderBy: { date: 'asc' },
      take: limitNum,
    });

    res.status(200).json({ success: true, data: fixtures });
  } catch (error: any) {
    console.error('Error fetching upcoming fixtures:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get recently completed fixtures
 */
export const getRecentlyCompletedFixtures = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { limit = 20, days = 30 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const daysNum = Math.max(1, parseInt(days as string) || 30);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysNum);

    const fixtures = await prisma.sportsFixture.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        recordedAt: {
          gte: cutoffDate,
        },
      },
      include: { tournament: true },
      orderBy: { recordedAt: 'desc' },
      take: limitNum,
    });

    res.status(200).json({ success: true, data: fixtures });
  } catch (error: any) {
    console.error('Error fetching recently completed fixtures:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
