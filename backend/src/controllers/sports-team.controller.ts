import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { randomBytes } from 'crypto';

const sportsManagerRoles = new Set(['ADMIN', 'TEACHER', 'SUPER_ADMIN']);

const getTenantId = (req: AuthenticatedRequest): string | null => req.user?.tenantId ?? null;

const requireSportsTenant = (req: AuthenticatedRequest, res: Response): string | null => {
  const tenantId = getTenantId(req);
  if (!req.user || !tenantId) {
    res.status(403).json({ success: false, message: 'A tenant account is required.' });
    return null;
  }
  return tenantId;
};

const requireSportsManager = (req: AuthenticatedRequest, res: Response): string | null => {
  if (!req.user || !sportsManagerRoles.has(req.user.role)) {
    res.status(403).json({ success: false, message: 'Sports management access is required.' });
    return null;
  }
  return requireSportsTenant(req, res);
};

/**
 * Get team members
 */
export const getTeamMembers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { teamId } = req.params;
    if (!teamId || typeof teamId !== 'string') {
      res.status(400).json({ success: false, message: 'Team ID is required.' });
      return;
    }

    // Verify team exists
    const team = await prisma.sportsTeam.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    const members = await prisma.sportsTeamMember.findMany({
      where: { teamId, tenantId, isActive: true },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'desc' }],
    });

    res.status(200).json({ success: true, data: members });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Add a member to a team (manager only)
 */
export const addTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const { teamId, userId, role } = req.body;

    if (!teamId || typeof teamId !== 'string') {
      res.status(400).json({ success: false, message: 'Team ID is required.' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, message: 'User ID is required.' });
      return;
    }

    const validRoles = ['CAPTAIN', 'VICE_CAPTAIN', 'PLAYER', 'COACH', 'SUPPORT_STAFF'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
      return;
    }

    // Verify team exists
    const team = await prisma.sportsTeam.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Check if user is already a member
    const existing = await prisma.sportsTeamMember.findFirst({
      where: { teamId, userId },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'User is already a team member.' });
      return;
    }

    const member = await prisma.sportsTeamMember.create({
      data: {
        tenantId,
        teamId,
        userId,
        role: role as any,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Update team member role
 */
export const updateTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const { memberId } = req.params;
    const { role, jerseyNumber } = req.body;

    if (!memberId || typeof memberId !== 'string') {
      res.status(400).json({ success: false, message: 'Member ID is required.' });
      return;
    }

    const data: Prisma.SportsTeamMemberUpdateInput = {};

    if (role) {
      const validRoles = ['CAPTAIN', 'VICE_CAPTAIN', 'PLAYER', 'COACH', 'SUPPORT_STAFF'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
        return;
      }
      data.role = role as any;
    }

    if (jerseyNumber !== undefined && jerseyNumber !== null) {
      if (!Number.isInteger(jerseyNumber) || jerseyNumber < 1) {
        res.status(400).json({ success: false, message: 'Jersey number must be a positive integer.' });
        return;
      }
      data.jerseyNumber = jerseyNumber;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ success: false, message: 'At least one field to update is required.' });
      return;
    }

    const member = await prisma.sportsTeamMember.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      res.status(404).json({ success: false, message: 'Team member not found.' });
      return;
    }

    const updated = await prisma.sportsTeamMember.update({
      where: { id: memberId },
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Remove a member from a team
 */
export const removeTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const { memberId } = req.params;

    if (!memberId || typeof memberId !== 'string') {
      res.status(400).json({ success: false, message: 'Member ID is required.' });
      return;
    }

    const member = await prisma.sportsTeamMember.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      res.status(404).json({ success: false, message: 'Team member not found.' });
      return;
    }

    await prisma.sportsTeamMember.update({
      where: { id: memberId },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    res.status(200).json({ success: true, message: 'Team member removed successfully.' });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Generate a team join code for invitations
 */
export const generateTeamJoinCode = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { teamId } = req.params;
    if (!teamId || typeof teamId !== 'string') {
      res.status(400).json({ success: false, message: 'Team ID is required.' });
      return;
    }

    // Verify team exists
    const team = await prisma.sportsTeam.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    // Generate unique code
    const code = `TEAM-${randomBytes(6).toString('hex').toUpperCase()}`;

    res.status(200).json({
      success: true,
      data: {
        code,
        teamId,
        expiresIn: '7 days',
      },
    });
  } catch (error: any) {
    console.error('Error generating team join code:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Send team invitation to a user
 */
export const sendTeamInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const { teamId, userId, expiresIn = 7 } = req.body;

    if (!teamId || typeof teamId !== 'string') {
      res.status(400).json({ success: false, message: 'Team ID is required.' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, message: 'User ID is required.' });
      return;
    }

    // Verify team exists
    const team = await prisma.sportsTeam.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.sportsTeamMember.findFirst({
      where: { teamId, userId, isActive: true },
    });

    if (existingMember) {
      res.status(409).json({ success: false, message: 'User is already a team member.' });
      return;
    }

    // Check if invitation already exists
    const existingInvite = await prisma.sportsTeamInvitation.findFirst({
      where: { teamId, userId, status: 'PENDING' },
    });

    if (existingInvite) {
      res.status(409).json({ success: false, message: 'An invitation is already pending for this user.' });
      return;
    }

    const code = `INV-${randomBytes(8).toString('hex').toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (Number.isInteger(expiresIn) ? expiresIn : 7));

    const invitation = await prisma.sportsTeamInvitation.create({
      data: {
        tenantId,
        teamId,
        userId,
        code,
        status: 'PENDING',
        expiresAt,
      },
    });

    res.status(201).json({ success: true, data: invitation });
  } catch (error: any) {
    console.error('Error sending team invitation:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Accept a team invitation
 */
export const acceptTeamInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const { invitationCode } = req.body;

    if (!invitationCode || typeof invitationCode !== 'string') {
      res.status(400).json({ success: false, message: 'Invitation code is required.' });
      return;
    }

    const invitation = await prisma.sportsTeamInvitation.findFirst({
      where: {
        code: invitationCode.toUpperCase(),
        tenantId,
      },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invitation not found.' });
      return;
    }

    if (invitation.userId !== user.userId) {
      res.status(403).json({ success: false, message: 'This invitation is not for you.' });
      return;
    }

    if (invitation.status !== 'PENDING') {
      res.status(409).json({ success: false, message: `Invitation has already been ${invitation.status.toLowerCase()}.` });
      return;
    }

    if (new Date() > invitation.expiresAt) {
      res.status(410).json({ success: false, message: 'Invitation has expired.' });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.sportsTeamMember.findFirst({
      where: { teamId: invitation.teamId, userId: user.userId, isActive: true },
    });

    if (existingMember) {
      res.status(409).json({ success: false, message: 'You are already a member of this team.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create team member
      const member = await tx.sportsTeamMember.create({
        data: {
          tenantId,
          teamId: invitation.teamId,
          userId: user.userId,
          role: 'PLAYER',
        },
      });

      // Update invitation
      await tx.sportsTeamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      return member;
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error accepting team invitation:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Reject a team invitation
 */
export const rejectTeamInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const { invitationCode } = req.body;

    if (!invitationCode || typeof invitationCode !== 'string') {
      res.status(400).json({ success: false, message: 'Invitation code is required.' });
      return;
    }

    const invitation = await prisma.sportsTeamInvitation.findFirst({
      where: {
        code: invitationCode.toUpperCase(),
        tenantId,
      },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invitation not found.' });
      return;
    }

    if (invitation.userId !== user.userId) {
      res.status(403).json({ success: false, message: 'This invitation is not for you.' });
      return;
    }

    if (invitation.status !== 'PENDING') {
      res.status(409).json({ success: false, message: `Invitation has already been ${invitation.status.toLowerCase()}.` });
      return;
    }

    await prisma.sportsTeamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, message: 'Invitation rejected.' });
  } catch (error: any) {
    console.error('Error rejecting team invitation:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get my team memberships
 */
export const getMyTeamMemberships = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const memberships = await prisma.sportsTeamMember.findMany({
      where: {
        userId: user.userId,
        tenantId,
        isActive: true,
      },
      include: {
        team: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: memberships });
  } catch (error: any) {
    console.error('Error fetching my team memberships:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * List pending invitations for current user
 */
export const getMyTeamInvitations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const invitations = await prisma.sportsTeamInvitation.findMany({
      where: {
        userId: user.userId,
        tenantId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: invitations });
  } catch (error: any) {
    console.error('Error fetching my team invitations:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
