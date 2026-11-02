import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const listSportsEvents = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    if (!user.tenantId && user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Your account is not assigned to an organization.',
      });
      return;
    }

    // A tenantless Super Admin is the only role allowed to browse across tenants.
    const where = user.tenantId ? { tenantId: user.tenantId } : {};

    const events = await prisma.sportsEvent.findMany({
      where,
      include: {
        registrations: {
          where: { userId: user.userId },
          select: {
            userId: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    console.error('Error listing sports events:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getMySportsRegistrations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const registrations = await prisma.sportsRegistration.findMany({
      where: {
        userId: user.userId,
        ...(user.tenantId ? { event: { is: { tenantId: user.tenantId } } } : {}),
      },
      include: {
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('Error fetching my sports registrations:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerForSport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { eventId, jerseyNumber, roleInTeam, notes } = req.body;
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (typeof eventId !== 'string' || !eventId || !userId) {
      res.status(400).json({ success: false, message: 'Event ID and authenticated User are required' });
      return;
    }

    if (!tenantId) {
      res.status(403).json({
        success: false,
        message: 'A tenant account is required to register for a sports event.',
      });
      return;
    }

    const event = await prisma.sportsEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Sports event not found.' });
      return;
    }

    const existingRegistration = await prisma.sportsRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      res.status(409).json({
        success: false,
        message: 'You are already registered for this sports event.',
      });
      return;
    }

    const normalizedJerseyNumber =
      jerseyNumber === undefined || jerseyNumber === null || jerseyNumber === ''
        ? null
        : Number(jerseyNumber);

    const registration = await prisma.sportsRegistration.create({
      data: {
        eventId,
        userId,
        jerseyNumber: normalizedJerseyNumber,
        roleInTeam: roleInTeam || null,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registered for sport event successfully',
      data: registration,
    });
  } catch (error: any) {
    console.error('Error registering for sport:', error);

    if (error?.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'You are already registered for this sports event.',
      });
      return;
    }

    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
