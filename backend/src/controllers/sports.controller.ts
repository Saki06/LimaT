import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const listSportsEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.sportsEvent.findMany({
      include: {
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

export const registerForSport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { eventId, jerseyNumber, roleInTeam, notes } = req.body;
    const userId = req.user?.userId;

    if (!eventId || !userId) {
      res.status(400).json({ success: false, message: 'Event ID and authenticated User are required' });
      return;
    }

    const registration = await prisma.sportsRegistration.create({
      data: {
        eventId,
        userId,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
        roleInTeam,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registered for sport event successfully',
      data: registration,
    });
  } catch (error: any) {
    console.error('Error registering for sport:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
