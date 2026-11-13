// @ts-nocheck
import { Response } from 'express';
import { Prisma, BracketType, MatchStatus } from '@prisma/client';
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

// Helper to ensure value is number
const ensureNumber = (val: any): number | null => {
  if (!val) return null;
  const str = Array.isArray(val) ? val[0] : String(val);
  const num = parseInt(str);
  return Number.isNaN(num) ? null : num;
};

/**
 * Create a new tournament bracket
 */
export const createBracket = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const body = req.body;
    const tournamentId = ensureString(body.tournamentId);
    const typeStr = ensureString(body.type);
    const stageNum = ensureNumber(body.stage);
    const stageNameStr = ensureString(body.stageName);
    const matchCountNum = ensureNumber(body.matchCount) || 0;

    if (!tournamentId || !typeStr || !stageNum) {
      res.status(400).json({
        success: false,
        message: 'tournamentId, type, and stage are required.',
      });
      return;
    }

    if (!['KNOCKOUT', 'GROUP', 'ROUND_ROBIN', 'LEAGUE'].includes(typeStr)) {
      res.status(400).json({
        success: false,
        message: 'type must be KNOCKOUT, GROUP, ROUND_ROBIN, or LEAGUE.',
      });
      return;
    }

    const tournament = await prisma.sportsTournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament || tournament.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Tournament not found.' });
      return;
    }

    const bracket = await prisma.tournamentBracket.create({
      data: {
        tenantId,
        tournamentId,
        type: typeStr as BracketType,
        stage: stageNum,
        stageName: stageNameStr || `Round ${stageNum}`,
        matchCount: matchCountNum,
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: bracket });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Bracket for this stage already exists.' });
      return;
    }
    console.error('Error creating bracket:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get bracket by ID with all matches
 */
export const getBracketById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { bracketId } = req.params;

    const bracket = await prisma.tournamentBracket.findUnique({
      where: { id: bracketId },
      include: {
        tournament: true,
        matches: {
          orderBy: { matchNumber: 'asc' },
          include: { fixture: true },
        },
      },
    });

    if (!bracket || bracket.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Bracket not found.' });
      return;
    }

    res.status(200).json({ success: true, data: bracket });
  } catch (error: any) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get all brackets for a tournament
 */
export const getTournamentBrackets = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    // @ts-ignore
    const { tournamentId } = req.params;

    const tournament = await prisma.sportsTournament.findUnique({
      where: { id: tournamentId as string },
    });

    if (!tournament || tournament.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Tournament not found.' });
      return;
    }

    const brackets = await prisma.tournamentBracket.findMany({
      where: { tournamentId: tournamentId as string, tenantId },
      include: {
        matches: {
          orderBy: { matchNumber: 'asc' },
        },
      },
      orderBy: { stage: 'asc' },
    });

    res.status(200).json({ success: true, data: brackets });
  } catch (error: any) {
    console.error('Error fetching tournament brackets:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const addMatchToBracket = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { bracketId } = req.params;
    const { matchNumber, team1Id, team1Name, team2Id, team2Name, fixtureId, scheduledDate, venue } =
      req.body;

    const matchNumVal = ensureNumber(matchNumber);
    const team1IdStr = ensureString(team1Id);
    const team1NameStr = ensureString(team1Name);
    const team2IdStr = ensureString(team2Id);
    const team2NameStr = ensureString(team2Name);
    const fixtureIdStr = ensureString(fixtureId);
    const venueStr = ensureString(venue);

    if (!matchNumVal || (!team1NameStr && !team1IdStr) || (!team2NameStr && !team2IdStr)) {
      res.status(400).json({
        success: false,
        message: 'matchNumber, team1Name or team1Id, and team2Name or team2Id are required.',
      });
      return;
    }

    const bracket = await prisma.tournamentBracket.findUnique({
      where: { id: bracketId },
    });

    if (!bracket || bracket.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Bracket not found.' });
      return;
    }

    // Check for duplicate match number in bracket
    const existing = await prisma.bracketMatch.findFirst({
      where: { bracketId, matchNumber: matchNumVal },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'Match number already exists in this bracket.' });
      return;
    }

    const match = await prisma.bracketMatch.create({
      data: {
        tenantId,
        bracketId,
        matchNumber: matchNumVal,
        team1Id: team1IdStr,
        team1Name: team1NameStr,
        team2Id: team2IdStr,
        team2Name: team2NameStr,
        fixtureId: fixtureIdStr,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        venue: venueStr,
        status: 'UPCOMING',
      },
      include: { fixture: true },
    });

    // Increment bracket's match count
    await prisma.tournamentBracket.update({
      where: { id: bracketId },
      data: { matchCount: bracket.matchCount + 1 },
    });

    res.status(201).json({ success: true, data: match });
  } catch (error: any) {
    console.error('Error adding match to bracket:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Update bracket match with result
 */
export const updateBracketMatchResult = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { matchId } = req.params;
    const { team1Score, team2Score, winnerId, winnerName, notes } = req.body;

    if (team1Score === undefined || team2Score === undefined) {
      res.status(400).json({ success: false, message: 'team1Score and team2Score are required.' });
      return;
    }

    if (!winnerId && !winnerName) {
      res.status(400).json({ success: false, message: 'winnerId or winnerName is required.' });
      return;
    }

    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
      include: { bracket: true },
    });

    if (!match || match.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Match not found.' });
      return;
    }

    if (match.status === 'COMPLETED') {
      res.status(409).json({
        success: false,
        message: 'Cannot update result for an already completed match.',
      });
      return;
    }

    const updated = await prisma.bracketMatch.update({
      where: { id: matchId },
      data: {
        team1Score,
        team2Score,
        winnerId: winnerId || null,
        winnerName: winnerName || null,
        status: 'COMPLETED',
        notes: notes || null,
      },
      include: { fixture: true, bracket: true },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating bracket match result:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Auto-progress winners to next round
 */
export const progressWinnerToNextRound = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { matchId } = req.params;
    const { nextBracketId, nextMatchNumber } = req.body;

    if (!nextBracketId || !nextMatchNumber) {
      res.status(400).json({
        success: false,
        message: 'nextBracketId and nextMatchNumber are required.',
      });
      return;
    }

    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
    });

    if (!match || match.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Match not found.' });
      return;
    }

    if (match.status !== 'COMPLETED') {
      res.status(409).json({
        success: false,
        message: 'Can only progress completed matches.',
      });
      return;
    }

    if (!match.winnerId && !match.winnerName) {
      res.status(409).json({
        success: false,
        message: 'Match has no winner set.',
      });
      return;
    }

    // Get or create match in next round
    const nextBracket = await prisma.tournamentBracket.findUnique({
      where: { id: nextBracketId },
    });

    if (!nextBracket || nextBracket.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Next bracket not found.' });
      return;
    }

    let nextMatch = await prisma.bracketMatch.findFirst({
      where: {
        bracketId: nextBracketId,
        matchNumber: parseInt(nextMatchNumber),
      },
    });

    if (!nextMatch) {
      // Create the match in next round
      nextMatch = await prisma.bracketMatch.create({
        data: {
          tenantId,
          bracketId: nextBracketId,
          matchNumber: parseInt(nextMatchNumber),
          team1Id: match.winnerId || null,
          team1Name: match.winnerName || null,
          status: 'UPCOMING',
        },
      });

      // Increment next bracket's match count
      await prisma.tournamentBracket.update({
        where: { id: nextBracketId },
        data: { matchCount: nextBracket.matchCount + 1 },
      });
    } else {
      // Update existing match with winner
      const isTeam1Empty = !nextMatch.team1Id && !nextMatch.team1Name;
      if (isTeam1Empty) {
        nextMatch = await prisma.bracketMatch.update({
          where: { id: nextMatch.id },
          data: {
            team1Id: match.winnerId || null,
            team1Name: match.winnerName || null,
          },
          include: { fixture: true },
        });
      } else {
        nextMatch = await prisma.bracketMatch.update({
          where: { id: nextMatch.id },
          data: {
            team2Id: match.winnerId || null,
            team2Name: match.winnerName || null,
          },
          include: { fixture: true },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        currentMatch: match,
        nextMatch,
      },
    });
  } catch (error: any) {
    console.error('Error progressing winner:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get bracket match results
 */
export const getBracketResults = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { bracketId } = req.params;

    const bracket = await prisma.tournamentBracket.findUnique({
      where: { id: bracketId },
      include: {
        matches: {
          where: { status: 'COMPLETED' },
          orderBy: { matchNumber: 'asc' },
          include: { fixture: true },
        },
      },
    });

    if (!bracket || bracket.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Bracket not found.' });
      return;
    }

    res.status(200).json({ success: true, data: bracket });
  } catch (error: any) {
    console.error('Error fetching bracket results:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Update bracket status
 */
export const updateBracketStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsAdmin(req, res);
    if (!tenantId) return;

    const { bracketId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'status must be pending, in_progress, or completed.',
      });
      return;
    }

    const bracket = await prisma.tournamentBracket.findUnique({
      where: { id: bracketId },
    });

    if (!bracket || bracket.tenantId !== tenantId) {
      res.status(404).json({ success: false, message: 'Bracket not found.' });
      return;
    }

    const updated = await prisma.tournamentBracket.update({
      where: { id: bracketId },
      data: { status },
      include: {
        matches: {
          orderBy: { matchNumber: 'asc' },
        },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating bracket status:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
