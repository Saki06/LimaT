import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const sportsManagerRoles = new Set(['ADMIN', 'TEACHER', 'SUPER_ADMIN']);

const getTenantId = (req: AuthenticatedRequest): string | null => req.user?.tenantId ?? null;

const requireSportsManager = (req: AuthenticatedRequest, res: Response): string | null => {
  const tenantId = getTenantId(req);
  if (!req.user || !sportsManagerRoles.has(req.user.role)) {
    res.status(403).json({ success: false, message: 'Sports management access is required.' });
    return null;
  }
  if (!tenantId) {
    res.status(403).json({ success: false, message: 'A tenant account is required.' });
    return null;
  }
  return tenantId;
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

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

    let events = await prisma.sportsEvent.findMany({
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

    if (events.length === 0) {
      let candidateTenantId = user.tenantId;
      if (!candidateTenantId) {
        const activeTenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
        candidateTenantId = activeTenant?.id ?? null;
      }

      if (candidateTenantId) {
        const targetTenantId: string = candidateTenantId;
        const defaultEvents = [
          {
            tenantId: targetTenantId,
            title: 'Annual Inter-House Sports & Athletic Meet 2026',
            sportType: 'Physical Education & Sports Committee',
            description: 'Track and field events, house parades, relay finals, and prize distribution. Attendance compulsory for all student houses.',
            venue: 'National Sports Complex & Athletic Grounds',
            startDate: new Date(Date.now() + 7 * 86400000),
            maxParticipants: 2000,
            fee: 0,
            ageCategory: 'all',
          },
          {
            tenantId: targetTenantId,
            title: 'Young Inventors National Science & AI Exhibition',
            sportType: 'Science Society & ICT Club',
            description: 'Interactive STEM pavilions, robotics showcase, coding hackathon finals, and prototype demos.',
            venue: 'College Main Auditorium & Science Labs',
            startDate: new Date(Date.now() + 14 * 86400000),
            maxParticipants: 450,
            fee: 0,
            ageCategory: 'students',
          },
          {
            tenantId: targetTenantId,
            title: 'National Collegiate Debating Championship Finals',
            sportType: 'Literary & Debating Union',
            description: 'Inter-collegiate parliamentary debate finals. Topic: Artificial Intelligence, Autonomous Systems and Ethics.',
            venue: 'College Assembly Hall',
            startDate: new Date(Date.now() + 21 * 86400000),
            maxParticipants: 300,
            fee: 0,
            ageCategory: 'all',
          },
          {
            tenantId: targetTenantId,
            title: 'Annual Shakespeare Drama & Cultural Festival',
            sportType: 'English Drama Society',
            description: 'Inter-house collegiate drama festival featuring adaptations of classical literature, orchestral music, and student cultural acts.',
            venue: 'Performing Arts Center',
            startDate: new Date(Date.now() + 28 * 86400000),
            maxParticipants: 600,
            fee: 0,
            ageCategory: 'all',
          },
        ];

        for (const item of defaultEvents) {
          await prisma.sportsEvent.create({ data: item });
        }

        events = await prisma.sportsEvent.findMany({
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
      }
    }

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

export const listSportsDisciplines = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const disciplines = await prisma.sportsDiscipline.findMany({
      where: tenantId ? { tenantId } : {},
      include: { events: { orderBy: { startDate: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: disciplines });
  } catch (error: any) {
    console.error('Error listing sports disciplines:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSportsDiscipline = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const { name, category, description, iconName, isTeamSport } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ success: false, message: 'Sport name and category are required.' });
      return;
    }

    const discipline = await prisma.sportsDiscipline.create({
      data: {
        tenantId,
        name: name.trim(),
        category: category.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        iconName: typeof iconName === 'string' && iconName.trim() ? iconName.trim() : 'Trophy',
        isTeamSport: Boolean(isTeamSport),
      },
    });
    res.status(201).json({ success: true, data: discipline });
  } catch (error: any) {
    console.error('Error creating sports discipline:', error);
    if (error?.code === 'P2002') {
      res.status(409).json({ success: false, message: 'This sport already exists.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSportsEvent = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const {
      disciplineId,
      title,
      sportType,
      ageCategory,
      gender,
      fee,
      maxParticipants,
      venue,
      startDate,
      endDate,
      description,
      isTeamSport,
    } = req.body;
    const starts = parseDate(startDate);
    const ends = endDate ? parseDate(endDate) : null;

    if (
      typeof title !== 'string' || !title.trim() ||
      typeof sportType !== 'string' || !sportType.trim() ||
      typeof venue !== 'string' || !venue.trim() || !starts ||
      (endDate && !ends) ||
      (fee !== undefined && (!Number.isInteger(Number(fee)) || Number(fee) < 0)) ||
      (maxParticipants !== undefined && maxParticipants !== null &&
        (!Number.isInteger(Number(maxParticipants)) || Number(maxParticipants) < 1))
    ) {
      res.status(400).json({ success: false, message: 'Sports event details are invalid.' });
      return;
    }
    if (disciplineId) {
      const discipline = await prisma.sportsDiscipline.findFirst({
        where: { id: disciplineId, tenantId },
      });
      if (!discipline) {
        res.status(404).json({ success: false, message: 'Sports discipline not found.' });
        return;
      }
    }

    const event = await prisma.sportsEvent.create({
      data: {
        tenantId,
        disciplineId: disciplineId || null,
        title: title.trim(),
        sportType: sportType.trim(),
        ageCategory: typeof ageCategory === 'string' ? ageCategory : null,
        gender: typeof gender === 'string' ? gender : null,
        fee: fee === undefined ? 0 : Number(fee),
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        venue: venue.trim(),
        startDate: starts,
        endDate: ends,
        description: typeof description === 'string' ? description.trim() : null,
        isTeamSport: Boolean(isTeamSport),
      },
    });
    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error creating sports event:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSportsEvent = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const eventId = String(req.params.id);
    const {
      title,
      sportType,
      ageCategory,
      gender,
      fee,
      maxParticipants,
      venue,
      startDate,
      endDate,
      description,
      isTeamSport,
      status,
    } = req.body;

    const existing = await prisma.sportsEvent.findFirst({
      where: {
        id: eventId,
        ...(req.user?.role === 'SUPER_ADMIN' ? {} : { tenantId }),
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const starts = startDate ? parseDate(startDate) : undefined;
    const ends = endDate !== undefined ? (endDate ? parseDate(endDate) : null) : undefined;

    const updated = await prisma.sportsEvent.update({
      where: { id: eventId },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(sportType !== undefined ? { sportType: sportType.trim() } : {}),
        ...(ageCategory !== undefined ? { ageCategory } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(fee !== undefined ? { fee: Number(fee) } : {}),
        ...(maxParticipants !== undefined ? { maxParticipants: maxParticipants ? Number(maxParticipants) : null } : {}),
        ...(venue !== undefined ? { venue: venue.trim() } : {}),
        ...(starts ? { startDate: starts } : {}),
        ...(ends !== undefined ? { endDate: ends } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isTeamSport !== undefined ? { isTeamSport: Boolean(isTeamSport) } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating sports event:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteSportsEvent = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;

    const eventId = String(req.params.id);

    const existing = await prisma.sportsEvent.findFirst({
      where: {
        id: eventId,
        ...(req.user?.role === 'SUPER_ADMIN' ? {} : { tenantId }),
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    await prisma.sportsEvent.delete({
      where: { id: eventId },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting sports event:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const cancelSportsRegistration = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const eventId = String(req.params.id);

    const deleted = await prisma.sportsRegistration.deleteMany({
      where: {
        eventId,
        userId: user.userId,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ success: false, message: 'Registration not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event registration cancelled successfully.',
    });
  } catch (error: any) {
    console.error('Error cancelling sports registration:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerChampionshipAthlete = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const tenantId = user?.tenantId;
    const { eventIds, registrationNumber, athleteDetails } = req.body;
    if (!user?.userId || !tenantId) {
      res.status(403).json({ success: false, message: 'A tenant account is required.' });
      return;
    }
    if (
      !Array.isArray(eventIds) || eventIds.length === 0 ||
      eventIds.some((id: unknown) => typeof id !== 'string') ||
      typeof registrationNumber !== 'string' || !registrationNumber.trim() ||
      !athleteDetails || typeof athleteDetails !== 'object' || Array.isArray(athleteDetails)
    ) {
      res.status(400).json({ success: false, message: 'Athlete and event registration details are required.' });
      return;
    }

    const uniqueEventIds = [...new Set(eventIds as string[])];
    const events = await prisma.sportsEvent.findMany({
      where: { id: { in: uniqueEventIds }, tenantId },
      include: {
        _count: { select: { registrations: true } },
        discipline: { select: { name: true } },
      },
    });
    if (events.length !== uniqueEventIds.length) {
      res.status(404).json({ success: false, message: 'One or more selected sports events were not found.' });
      return;
    }
    if (events.some((event) => event.status === 'CANCELLED' || event.status === 'COMPLETED')) {
      res.status(409).json({ success: false, message: 'A selected event is no longer accepting registrations.' });
      return;
    }

    const fullEvent = events.find(
      (event) => event.maxParticipants !== null && event._count.registrations >= event.maxParticipants,
    );
    if (fullEvent) {
      res.status(409).json({ success: false, message: `${fullEvent.title} has reached its participant limit.` });
      return;
    }

    const userRegistrations = await prisma.sportsRegistration.findMany({
      where: { userId: user.userId, eventId: { in: uniqueEventIds } },
      select: { eventId: true },
    });
    if (userRegistrations.length) {
      res.status(409).json({ success: false, message: 'You are already registered for one or more selected events.' });
      return;
    }

    const details = athleteDetails as Record<string, unknown>;
    const totalAmount = events.reduce((total, event) => total + event.fee, 0);
    if (
      events.some((event) => !Number.isInteger(event.fee) || event.fee < 0) ||
      !Number.isSafeInteger(totalAmount) ||
      totalAmount > 2_147_483_647
    ) {
      res.status(400).json({ success: false, message: 'Registration fee is invalid.' });
      return;
    }
    const athleteDetailsData = Object.fromEntries(
      Object.entries(details).filter(([key]) => key !== 'paymentStatus' && key !== 'totalAmount'),
    );
    athleteDetailsData.selectedEvents = events.map((event) => ({
      id: event.id,
      sportName: event.discipline?.name || event.sportType,
      eventName: event.title,
      ageCategory: event.ageCategory || 'Open',
      gender: event.gender || 'All',
      fee: event.fee,
    }));
    const registrations = await prisma.$transaction(
      uniqueEventIds.map((eventId) =>
        prisma.sportsRegistration.create({
          data: {
            eventId,
            userId: user.userId,
            status: 'PENDING',
            registrationNumber: registrationNumber.trim(),
            athleteDetails: athleteDetailsData as Prisma.InputJsonValue,
            paymentStatus: 'PENDING',
            totalAmount,
            notes: typeof details.notes === 'string' ? details.notes : null,
          },
          include: { event: true },
        }),
      ),
    );
    res.status(201).json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('Error registering championship athlete:', error);
    if (error?.code === 'P2002') {
      res.status(409).json({ success: false, message: 'You are already registered for one or more selected events.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const listSportsRegistrations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const registrations = await prisma.sportsRegistration.findMany({
      where: { event: { is: { tenantId } } },
      include: { event: true, user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('Error listing sports registrations:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSportsRegistrationStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const registrationNumber = typeof req.params.registrationNumber === 'string'
      ? req.params.registrationNumber
      : '';
    const statusMap: Record<string, 'PENDING' | 'CONFIRMED' | 'REJECTED'> = {
      Pending: 'PENDING',
      Approved: 'CONFIRMED',
      Confirmed: 'CONFIRMED',
      Rejected: 'REJECTED',
    };
    const status = statusMap[req.body.status];
    if (!registrationNumber || !status) {
      res.status(400).json({ success: false, message: 'Registration number and valid status are required.' });
      return;
    }
    const result = await prisma.sportsRegistration.updateMany({
      where: {
        registrationNumber,
        event: { is: { tenantId } },
      },
      data: { status },
    });
    if (result.count === 0) {
      res.status(404).json({ success: false, message: 'Sports registration not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { registrationNumber, status } });
  } catch (error: any) {
    console.error('Error updating sports registration:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const listSportsTeams = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }
    const teams = await prisma.sportsTeam.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: teams });
  } catch (error: any) {
    console.error('Error listing sports teams:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSportsTeam = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const { sportName, name, coachName, trainingSchedule, status, players } = req.body;
    if (typeof sportName !== 'string' || !sportName.trim() || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Sport and team names are required.' });
      return;
    }
    const roster = Array.isArray(players) ? players : [];
    const team = await prisma.sportsTeam.create({
      data: {
        tenantId,
        sportName: sportName.trim(),
        name: name.trim(),
        coachName: typeof coachName === 'string' ? coachName.trim() : '',
        trainingSchedule: typeof trainingSchedule === 'string' ? trainingSchedule.trim() : '',
        status: typeof status === 'string' ? status : 'active',
        playersCount: roster.length,
        players: roster as Prisma.InputJsonValue,
      },
    });
    res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    console.error('Error creating sports team:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSportsTeam = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const { sportName, name, coachName, trainingSchedule, status, players } = req.body;
    const data: Prisma.SportsTeamUpdateInput = {};
    if (typeof sportName === 'string' && sportName.trim()) data.sportName = sportName.trim();
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (typeof coachName === 'string') data.coachName = coachName.trim();
    if (typeof trainingSchedule === 'string') data.trainingSchedule = trainingSchedule.trim();
    if (typeof status === 'string') data.status = status;
    if (Array.isArray(players)) {
      data.players = players as Prisma.InputJsonValue;
      data.playersCount = players.length;
    }
    const result = await prisma.sportsTeam.updateMany({
      where: { id, tenantId },
      data,
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Sports team not found.' });
      return;
    }
    const team = await prisma.sportsTeam.findUnique({ where: { id } });
    res.status(200).json({ success: true, data: team });
  } catch (error: any) {
    console.error('Error updating sports team:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteSportsTeam = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await prisma.sportsTeam.deleteMany({
      where: { id, tenantId },
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Sports team not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Sports team deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting sports team:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const listSportsTournaments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }
    const tournaments = await prisma.sportsTournament.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { startDate: 'asc' },
    });
    res.status(200).json({ success: true, data: tournaments });
  } catch (error: any) {
    console.error('Error listing sports tournaments:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSportsTournament = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const body = req.body;
    const startDate = parseDate(body.startDate);
    const endDate = parseDate(body.endDate);
    if (
      typeof body.name !== 'string' || !body.name.trim() ||
      typeof body.sportName !== 'string' || !body.sportName.trim() ||
      !startDate || !endDate || endDate < startDate ||
      typeof body.venue !== 'string' || !body.venue.trim()
    ) {
      res.status(400).json({ success: false, message: 'Tournament details are invalid.' });
      return;
    }
    const teams = Array.isArray(body.participatingTeams)
      ? body.participatingTeams.filter((team: unknown): team is string => typeof team === 'string')
      : [];
    const tournament = await prisma.sportsTournament.create({
      data: {
        tenantId,
        name: body.name.trim(),
        sportName: body.sportName.trim(),
        category: typeof body.category === 'string' ? body.category : 'Open',
        format: typeof body.format === 'string' ? body.format : 'knockout',
        startDate,
        endDate,
        venue: body.venue.trim(),
        organizer: typeof body.organizer === 'string' ? body.organizer : '',
        teamsCount: teams.length,
        participatingTeams: teams,
        status: typeof body.status === 'string' ? body.status : 'upcoming',
        trophyTitle: typeof body.trophyTitle === 'string' ? body.trophyTitle : '',
        description: typeof body.description === 'string' ? body.description : '',
        rules: typeof body.rules === 'string' ? body.rules : null,
        currentRound: typeof body.currentRound === 'string' ? body.currentRound : null,
      },
    });
    res.status(201).json({ success: true, data: tournament });
  } catch (error: any) {
    console.error('Error creating sports tournament:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSportsTournament = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const body = req.body;
    const existing = await prisma.sportsTournament.findFirst({ where: { id, tenantId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Sports tournament not found.' });
      return;
    }
    const startDate = body.startDate === undefined ? existing.startDate : parseDate(body.startDate);
    const endDate = body.endDate === undefined ? existing.endDate : parseDate(body.endDate);
    if (!startDate || !endDate || endDate < startDate) {
      res.status(400).json({ success: false, message: 'Tournament dates are invalid.' });
      return;
    }
    const participatingTeams = Array.isArray(body.participatingTeams)
      ? body.participatingTeams.filter((team: unknown): team is string => typeof team === 'string')
      : existing.participatingTeams;
    const tournament = await prisma.sportsTournament.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name.trim() : existing.name,
        sportName: typeof body.sportName === 'string' ? body.sportName.trim() : existing.sportName,
        category: typeof body.category === 'string' ? body.category : existing.category,
        format: typeof body.format === 'string' ? body.format : existing.format,
        startDate,
        endDate,
        venue: typeof body.venue === 'string' ? body.venue.trim() : existing.venue,
        organizer: typeof body.organizer === 'string' ? body.organizer : existing.organizer,
        participatingTeams,
        teamsCount: participatingTeams.length,
        status: typeof body.status === 'string' ? body.status : existing.status,
        trophyTitle: typeof body.trophyTitle === 'string' ? body.trophyTitle : existing.trophyTitle,
        description: typeof body.description === 'string' ? body.description : existing.description,
        rules: typeof body.rules === 'string' ? body.rules : existing.rules,
        currentRound: typeof body.currentRound === 'string' ? body.currentRound : existing.currentRound,
        champion: typeof body.champion === 'string' ? body.champion : existing.champion,
        runnerUp: typeof body.runnerUp === 'string' ? body.runnerUp : existing.runnerUp,
      },
    });
    res.status(200).json({ success: true, data: tournament });
  } catch (error: any) {
    console.error('Error updating sports tournament:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteSportsTournament = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const deleted = await prisma.sportsTournament.deleteMany({ where: { id, tenantId } });
    if (!deleted.count) {
      res.status(404).json({ success: false, message: 'Sports tournament not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Error deleting sports tournament:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const listSportsFixtures = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }
    const fixtures = await prisma.sportsFixture.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    res.status(200).json({ success: true, data: fixtures });
  } catch (error: any) {
    console.error('Error listing sports fixtures:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSportsFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const body = req.body;
    const date = parseDate(body.date);
    if (
      typeof body.sportName !== 'string' || !body.sportName.trim() ||
      typeof body.homeTeam !== 'string' || !body.homeTeam.trim() ||
      typeof body.awayTeam !== 'string' || !body.awayTeam.trim() ||
      !date || typeof body.venue !== 'string' || !body.venue.trim()
    ) {
      res.status(400).json({ success: false, message: 'Fixture details are invalid.' });
      return;
    }
    const tournamentId = typeof body.tournamentId === 'string' && body.tournamentId.trim()
      ? body.tournamentId.trim()
      : null;
    if (tournamentId) {
      const tournament = await prisma.sportsTournament.findFirst({
        where: { id: tournamentId, tenantId },
        select: { id: true },
      });
      if (!tournament) {
        res.status(404).json({ success: false, message: 'Tournament not found for this school.' });
        return;
      }
    }
    const fixture = await prisma.sportsFixture.create({
      data: {
        tenantId,
        tournamentId,
        sportName: body.sportName.trim(),
        homeTeam: body.homeTeam.trim(),
        awayTeam: body.awayTeam.trim(),
        competitionName: typeof body.competitionName === 'string' ? body.competitionName : '',
        roundName: typeof body.roundName === 'string' ? body.roundName : null,
        homeDistrict: typeof body.homeDistrict === 'string' ? body.homeDistrict : null,
        awayDistrict: typeof body.awayDistrict === 'string' ? body.awayDistrict : null,
        date,
        time: typeof body.time === 'string' ? body.time : '',
        venue: body.venue.trim(),
        status: 'scheduled',
      },
    });
    res.status(201).json({ success: true, data: fixture });
  } catch (error: any) {
    console.error('Error creating sports fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const recordSportsFixtureResult = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const { homeScore, awayScore, outcome } = req.body;
    if (
      typeof homeScore !== 'string' || !homeScore.trim() ||
      typeof awayScore !== 'string' || !awayScore.trim() ||
      typeof outcome !== 'string' || !outcome.trim()
    ) {
      res.status(400).json({ success: false, message: 'Both scores and the match outcome are required.' });
      return;
    }
    const result = await prisma.sportsFixture.updateMany({
      where: { id, tenantId },
      data: {
        homeScore: homeScore.trim(),
        awayScore: awayScore.trim(),
        outcome: outcome.trim(),
        recordedAt: new Date(),
        status: 'completed',
      },
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Sports fixture not found.' });
      return;
    }
    const fixture = await prisma.sportsFixture.findUnique({ where: { id } });
    res.status(200).json({ success: true, data: fixture });
  } catch (error: any) {
    console.error('Error recording sports fixture result:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSportsFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const body = req.body;
    const data: Prisma.SportsFixtureUpdateInput = {};
    if (typeof body.sportName === 'string' && body.sportName.trim()) data.sportName = body.sportName.trim();
    if (typeof body.homeTeam === 'string' && body.homeTeam.trim()) data.homeTeam = body.homeTeam.trim();
    if (typeof body.awayTeam === 'string' && body.awayTeam.trim()) data.awayTeam = body.awayTeam.trim();
    if (typeof body.competitionName === 'string') data.competitionName = body.competitionName;
    if (typeof body.venue === 'string' && body.venue.trim()) data.venue = body.venue.trim();
    if (typeof body.time === 'string') data.time = body.time;
    if (body.date) {
      const parsed = parseDate(body.date);
      if (parsed) data.date = parsed;
    }
    if (typeof body.status === 'string') data.status = body.status;
    const result = await prisma.sportsFixture.updateMany({
      where: { id, tenantId },
      data,
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Sports fixture not found.' });
      return;
    }
    const fixture = await prisma.sportsFixture.findUnique({ where: { id } });
    res.status(200).json({ success: true, data: fixture });
  } catch (error: any) {
    console.error('Error updating sports fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteSportsFixture = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsManager(req, res);
    if (!tenantId) return;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await prisma.sportsFixture.deleteMany({
      where: { id, tenantId },
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Sports fixture not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Sports fixture deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting sports fixture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const listSportsStandings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }
    const fixtures = await prisma.sportsFixture.findMany({
      where: { ...(tenantId ? { tenantId } : {}), status: 'completed' },
      orderBy: { date: 'asc' },
    });
    const groups = new Map<string, Map<string, {
      id: string;
      teamName: string;
      schoolName: string;
      sport: string;
      division: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      scoredFor: number;
      scoredAgainst: number;
      points: number;
      form: string[];
    }>>();

    const getScore = (score: string | null): number | null => {
      if (!score) return null;
      const parsed = Number.parseFloat(score.match(/^\s*(-?\d+(?:\.\d+)?)/)?.[1] ?? '');
      return Number.isFinite(parsed) ? parsed : null;
    };

    for (const fixture of fixtures) {
      const homeScore = getScore(fixture.homeScore);
      const awayScore = getScore(fixture.awayScore);
      if (homeScore === null || awayScore === null) continue;
      const groupKey = `${fixture.sportName.toLowerCase()}|${fixture.competitionName.toLowerCase()}`;
      if (!groups.has(groupKey)) groups.set(groupKey, new Map());
      const group = groups.get(groupKey)!;
      const division = fixture.roundName || 'Open';
      const getTeam = (teamName: string) => {
        if (!group.has(teamName)) {
          group.set(teamName, {
            id: `${groupKey}|${teamName}`,
            teamName,
            schoolName: teamName,
            sport: fixture.sportName.toLowerCase(),
            division,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            scoredFor: 0,
            scoredAgainst: 0,
            points: 0,
            form: [],
          });
        }
        return group.get(teamName)!;
      };
      const home = getTeam(fixture.homeTeam);
      const away = getTeam(fixture.awayTeam);
      home.played++;
      away.played++;
      home.scoredFor += homeScore;
      home.scoredAgainst += awayScore;
      away.scoredFor += awayScore;
      away.scoredAgainst += homeScore;
      if (homeScore > awayScore) {
        home.won++;
        home.points += 3;
        home.form.push('W');
        away.lost++;
        away.form.push('L');
      } else if (awayScore > homeScore) {
        away.won++;
        away.points += 3;
        away.form.push('W');
        home.lost++;
        home.form.push('L');
      } else {
        home.drawn++;
        away.drawn++;
        home.points++;
        away.points++;
        home.form.push('D');
        away.form.push('D');
      }
    }

    const data = Array.from(groups.entries()).flatMap(([groupKey, teamMap]) => {
      const teams = Array.from(teamMap.values())
        .sort((a, b) => b.points - a.points || (b.scoredFor - b.scoredAgainst) - (a.scoredFor - a.scoredAgainst))
        .map((team, index) => ({
          ...team,
          rank: index + 1,
          diffOrNrr: `${team.scoredFor - team.scoredAgainst >= 0 ? '+' : ''}${team.scoredFor - team.scoredAgainst}`,
          statusText: index < 2 ? 'Playoff position' : 'League',
          statusType: index < 2 ? 'qualified' : 'neutral',
        }));
      return teams.map((team) => ({ ...team, groupKey }));
    });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error deriving sports standings:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const verifySportsRegistration = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query) {
      res.status(400).json({ success: false, message: 'Registration number or mobile number is required.' });
      return;
    }
    const cleanQuery = query.toUpperCase();
    const registrations = await prisma.sportsRegistration.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        OR: [
          { registrationNumber: cleanQuery },
          { registrationNumber: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        event: {
          select: {
            title: true,
            sportType: true,
            venue: true,
            startDate: true,
            fee: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.status(200).json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('Error verifying sports registration:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
