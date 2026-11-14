import { Response } from 'express';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

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

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseFixtureScore = (value: string): number | null => {
  const parsed = Number.parseFloat(value.match(/^\s*(\d+(?:\.\d+)?)/)?.[1] ?? '');
  return Number.isFinite(parsed) ? parsed : null;
};

const getAthleteAge = (dateOfBirth: Date, now = new Date()): number => {
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  if (
    now.getMonth() < dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() && now.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
};

const isValidMobile = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^[+\d\s()-]+$/.test(value.trim())) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const validateAthleteDetails = (
  details: Record<string, unknown>,
  events: Array<{ title: string; ageCategory: string | null; gender: string | null }>,
): string | null => {
  for (const field of ['firstName', 'lastName', 'schoolName', 'district']) {
    if (typeof details[field] !== 'string' || !details[field].trim()) {
      return `Athlete ${field} is required.`;
    }
  }

  if (!isValidMobile(details.mobile)) {
    return 'A valid athlete mobile number is required.';
  }

  const dateOfBirth = parseDate(details.dob);
  if (!dateOfBirth || dateOfBirth > new Date()) {
    return 'A valid athlete date of birth is required.';
  }
  const age = getAthleteAge(dateOfBirth);
  if (age < 0 || (details.age !== undefined && Number(details.age) !== age)) {
    return 'Athlete age does not match the date of birth.';
  }
  if (!['Boys', 'Girls', 'Mixed'].includes(String(details.gender))) {
    return 'A valid athlete gender category is required.';
  }

  if (age < 18 && (
    typeof details.guardianName !== 'string' ||
    !details.guardianName.trim() ||
    !isValidMobile(details.guardianMobile) ||
    details.guardianConsent !== true
  )) {
    return 'Guardian details and consent are required for athletes under 18.';
  }

  for (const event of events) {
    const ageLimit = event.ageCategory?.match(/^U(12|14|15|16|17|18|19)$/i);
    if (ageLimit && age > Number(ageLimit[1])) {
      return `${event.title} is restricted to athletes aged ${ageLimit[1]} or younger.`;
    }
    if (
      (event.gender === 'Boys' && details.gender === 'Girls') ||
      (event.gender === 'Girls' && details.gender === 'Boys')
    ) {
      return `${event.title} is not available for the selected gender category.`;
    }
  }

  return null;
};

const generateRegistrationNumber = async (
  tx: Prisma.TransactionClient,
): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const registrationNumber = `SPORT-${new Date().getFullYear()}-${randomBytes(12)
      .toString('hex')
      .toUpperCase()}`;

    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${registrationNumber}))`;
    const existing = await tx.sportsRegistration.findFirst({
      where: { registrationNumber },
      select: { id: true },
    });
    if (!existing) return registrationNumber;
  }
  throw new Error('Unable to allocate a unique sports registration number.');
};

export const listSportsEvents = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const user = req.user;
    const where = user?.tenantId ? { tenantId: user.tenantId } : {};

    const events = await prisma.sportsEvent.findMany({
      where: { tenantId },
      include: {
        ...(user?.userId
          ? {
              registrations: {
                where: { userId: user.userId },
                select: {
                  userId: true,
                },
              },
            }
          : {}),
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
    const sanitizedEvents = events.map((event) => ({
      ...event,
      registrations: Array.isArray(event.registrations) ? event.registrations : [],
    }));

    res.status(200).json({ success: true, data: sanitizedEvents });
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const registrations = await prisma.sportsRegistration.findMany({
      where: {
        userId: user.userId,
        event: { is: { tenantId } },
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
    const user = req.user;
    const tenantId = requireSportsTenant(req, res);

    if (!tenantId) return;
    if (!user?.userId || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Only students can register for sports events.' });
      return;
    }
    if (typeof eventId !== 'string' || !eventId.trim()) {
      res.status(400).json({ success: false, message: 'Event ID and authenticated User are required' });
      return;
    }

    const normalizedJerseyNumber =
      jerseyNumber === undefined || jerseyNumber === null || jerseyNumber === ''
        ? null
        : Number(jerseyNumber);
    if (
      normalizedJerseyNumber !== null &&
      (!Number.isInteger(normalizedJerseyNumber) || normalizedJerseyNumber < 1)
    ) {
      res.status(400).json({ success: false, message: 'Jersey number must be a positive integer.' });
      return;
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const lockedEvents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "SportsEvent"
        WHERE "id" = ${eventId} AND "tenantId" = ${tenantId}
        FOR UPDATE
      `;
      if (lockedEvents.length === 0) return { kind: 'not_found' as const };
      const event = await tx.sportsEvent.findFirst({ where: { id: eventId, tenantId } });
      if (!event) return { kind: 'not_found' as const };
      if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
        return { kind: 'closed' as const };
      }

      // Check registration deadline
      if (event.registrationCloseDate && new Date() > event.registrationCloseDate) {
        return { kind: 'deadline_passed' as const };
      }

      // Check registration open date
      if (event.registrationOpenDate && new Date() < event.registrationOpenDate) {
        return { kind: 'not_open' as const };
      }

      const count = await tx.sportsRegistration.count({ where: { eventId } });
      if (event.maxParticipants !== null && count >= event.maxParticipants) {
        return { kind: 'full' as const };
      }

      const registrationNumber = await generateRegistrationNumber(tx);
      const registration = await tx.sportsRegistration.create({
        data: {
          eventId,
          userId: user.userId,
          jerseyNumber: normalizedJerseyNumber,
          roleInTeam: typeof roleInTeam === 'string' ? roleInTeam.trim() || null : null,
          notes: typeof notes === 'string' ? notes.trim() || null : null,
          registrationNumber,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmount: event.fee,
        },
      });
      return { kind: 'created' as const, registration };
    });

    if (outcome.kind === 'not_found') {
      res.status(404).json({ success: false, message: 'Sports event not found.' });
      return;
    }
    if (outcome.kind === 'closed') {
      res.status(409).json({ success: false, message: 'This sports event is no longer accepting registrations.' });
      return;
    }
    if (outcome.kind === 'full') {
      res.status(409).json({ success: false, message: 'This sports event has reached its participant limit.' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Registered for sport event successfully',
      data: outcome.registration,
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const disciplines = await prisma.sportsDiscipline.findMany({
      where: { tenantId },
      include: {
        events: {
          where: { tenantId },
          orderBy: { startDate: 'asc' },
        },
      },
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
      registrationOpenDate,
      registrationCloseDate,
    } = req.body;
    const starts = parseDate(startDate);
    const ends = endDate ? parseDate(endDate) : null;
    const regOpenDate = registrationOpenDate ? parseDate(registrationOpenDate) : null;
    const regCloseDate = registrationCloseDate ? parseDate(registrationCloseDate) : null;

    if (
      typeof title !== 'string' || !title.trim() ||
      typeof sportType !== 'string' || !sportType.trim() ||
      typeof venue !== 'string' || !venue.trim() || !starts ||
      (endDate && (!ends || ends < starts)) ||
      (fee !== undefined && (!Number.isSafeInteger(fee) || fee < 0 || fee > 2_147_483_647)) ||
      (maxParticipants !== undefined && maxParticipants !== null &&
        (!Number.isSafeInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 2_147_483_647))
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
        fee: fee === undefined ? 0 : fee,
        maxParticipants: maxParticipants === undefined ? null : maxParticipants,
        venue: venue.trim(),
        startDate: starts,
        endDate: ends,
        description: typeof description === 'string' ? description.trim() : null,
        isTeamSport: Boolean(isTeamSport),
        registrationOpenDate: regOpenDate,
        registrationCloseDate: regCloseDate,
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
      status,
      registrationOpenDate,
      registrationCloseDate,
    } = req.body;

    const existing = await prisma.sportsEvent.findFirst({
      where: {
        id: eventId,
        tenantId,
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const starts = startDate ? parseDate(startDate) : undefined;
    const ends = endDate !== undefined ? (endDate ? parseDate(endDate) : null) : undefined;
    const regOpenDate = registrationOpenDate ? parseDate(registrationOpenDate) : undefined;
    const regCloseDate = registrationCloseDate ? parseDate(registrationCloseDate) : undefined;
    const eventStatuses = ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'];
    if (
      (title !== undefined && (typeof title !== 'string' || !title.trim())) ||
      (sportType !== undefined && (typeof sportType !== 'string' || !sportType.trim())) ||
      (venue !== undefined && (typeof venue !== 'string' || !venue.trim())) ||
      (startDate !== undefined && !starts) ||
      (endDate !== undefined && endDate !== null && !ends) ||
      (starts && ends && ends < starts) ||
      (fee !== undefined && (!Number.isSafeInteger(fee) || fee < 0 || fee > 2_147_483_647)) ||
      (maxParticipants !== undefined && maxParticipants !== null &&
        (!Number.isSafeInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 2_147_483_647)) ||
      (status !== undefined && !eventStatuses.includes(status))
    ) {
      res.status(400).json({ success: false, message: 'Sports event details are invalid.' });
      return;
    }

    if (disciplineId !== undefined && disciplineId !== null) {
      if (typeof disciplineId !== 'string') {
        res.status(400).json({ success: false, message: 'Sports discipline is invalid.' });
        return;
      }
      const discipline = await prisma.sportsDiscipline.findFirst({
        where: { id: disciplineId, tenantId },
        select: { id: true },
      });
      if (!discipline) {
        res.status(404).json({ success: false, message: 'Sports discipline not found.' });
        return;
      }
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const lockedEvents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "SportsEvent"
        WHERE "id" = ${eventId} AND "tenantId" = ${tenantId}
        FOR UPDATE
      `;
      if (lockedEvents.length === 0) return { kind: 'not_found' as const };
      if (maxParticipants !== undefined && maxParticipants !== null) {
        const registrationCount = await tx.sportsRegistration.count({ where: { eventId } });
        if (maxParticipants < registrationCount) return { kind: 'limit' as const };
      }

      const event = await tx.sportsEvent.update({
        where: { id: eventId },
        data: {
          ...(disciplineId !== undefined ? { disciplineId } : {}),
          ...(title !== undefined ? { title: title.trim() } : {}),
          ...(sportType !== undefined ? { sportType: sportType.trim() } : {}),
          ...(ageCategory !== undefined ? { ageCategory } : {}),
          ...(gender !== undefined ? { gender } : {}),
          ...(fee !== undefined ? { fee } : {}),
          ...(maxParticipants !== undefined ? { maxParticipants } : {}),
          ...(venue !== undefined ? { venue: venue.trim() } : {}),
          ...(starts ? { startDate: starts } : {}),
          ...(ends !== undefined ? { endDate: ends } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isTeamSport !== undefined ? { isTeamSport: Boolean(isTeamSport) } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(regOpenDate !== undefined ? { registrationOpenDate: regOpenDate } : {}),
          ...(regCloseDate !== undefined ? { registrationCloseDate: regCloseDate } : {}),
        },
      });
      return { kind: 'updated' as const, event };
    });
    if (outcome.kind === 'not_found') {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }
    if (outcome.kind === 'limit') {
      res.status(409).json({
        success: false,
        message: 'Participant limit cannot be lower than the current registration count.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: outcome.event,
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

    const outcome = await prisma.$transaction(async (tx) => {
      const lockedEvents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "SportsEvent"
        WHERE "id" = ${eventId} AND "tenantId" = ${tenantId}
        FOR UPDATE
      `;
      if (lockedEvents.length === 0) return { kind: 'not_found' as const };
      const registrations = await tx.sportsRegistration.count({ where: { eventId } });
      if (registrations > 0) return { kind: 'has_registrations' as const };
      await tx.sportsEvent.delete({ where: { id: eventId } });
      return { kind: 'deleted' as const };
    });

    if (outcome.kind === 'not_found') {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }
    if (outcome.kind === 'has_registrations') {
      res.status(409).json({
        success: false,
        message: 'Events with registrations cannot be deleted. Cancel the event instead to preserve registration history.',
      });
      return;
    }

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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    if (!user?.userId) {
      res.status(401).json({ success: false, message: 'Authenticated user is required.' });
      return;
    }

    const eventId = typeof req.params.eventId === 'string' ? req.params.eventId : null;
    const registrationId = typeof req.params.registrationId === 'string' ? req.params.registrationId : null;
    const registrationWhere = eventId
      ? { eventId }
      : registrationId
        ? { id: registrationId }
        : null;
    if (!registrationWhere) {
      res.status(400).json({ success: false, message: 'A registration or event ID is required.' });
      return;
    }

    const deleted = await prisma.sportsRegistration.deleteMany({
      where: {
        ...registrationWhere,
        userId: user.userId,
        event: { tenantId },
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const { eventIds, athleteDetails } = req.body;
    if (!user?.userId || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Only students can register for championships.' });
      return;
    }
    if (
      !Array.isArray(eventIds) || eventIds.length === 0 ||
      eventIds.some((id: unknown) => typeof id !== 'string') ||
      !athleteDetails || typeof athleteDetails !== 'object' || Array.isArray(athleteDetails)
    ) {
      res.status(400).json({ success: false, message: 'Athlete and event registration details are required.' });
      return;
    }

    const uniqueEventIds = [...new Set(eventIds as string[])];
    const details = athleteDetails as Record<string, unknown>;
    if (uniqueEventIds.length !== eventIds.length) {
      res.status(400).json({ success: false, message: 'Duplicate event selections are not allowed.' });
      return;
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const sortedEventIds = [...uniqueEventIds].sort();
      await tx.$queryRaw`
        SELECT "id" FROM "SportsEvent"
        WHERE "id" IN (${Prisma.join(sortedEventIds)}) AND "tenantId" = ${tenantId}
        ORDER BY "id"
        FOR UPDATE
      `;
      const events = await tx.sportsEvent.findMany({
        where: { id: { in: uniqueEventIds }, tenantId },
        include: { discipline: { select: { name: true } } },
      });
      if (events.length !== uniqueEventIds.length) return { kind: 'not_found' as const };
      if (events.some((event) => event.status === 'CANCELLED' || event.status === 'COMPLETED')) {
        return { kind: 'closed' as const };
      }

      const eligibilityError = validateAthleteDetails(details, events);
      if (eligibilityError) return { kind: 'invalid' as const, message: eligibilityError };

      if (
        events.some((event) => !Number.isInteger(event.fee) || event.fee < 0) ||
        events.reduce((total, event) => total + event.fee, 0) > 2_147_483_647
      ) {
        return { kind: 'invalid' as const, message: 'Registration fee is invalid.' };
      }

      for (const event of events) {
        if (event.maxParticipants === null) continue;
        const count = await tx.sportsRegistration.count({ where: { eventId: event.id } });
        if (count >= event.maxParticipants) {
          return { kind: 'full' as const, title: event.title };
        }
      }

      const existing = await tx.sportsRegistration.findFirst({
        where: { userId: user.userId, eventId: { in: uniqueEventIds } },
        select: { id: true },
      });
      if (existing) return { kind: 'duplicate' as const };

      const totalAmount = events.reduce((total, event) => total + event.fee, 0);
      const eventEntries = events.map((event) => ({
        id: event.id,
        sportName: event.discipline?.name || event.sportType,
        eventName: event.title,
        ageCategory: event.ageCategory || 'Open',
        gender: event.gender || 'All',
        fee: event.fee,
      }));
      const age = getAthleteAge(parseDate(details.dob)!);
      const athleteDetailsData = {
        athleteName: `${String(details.firstName).trim()} ${String(details.lastName).trim()}`.trim(),
        firstName: String(details.firstName).trim(),
        lastName: String(details.lastName).trim(),
        dob: (details.dob as string).trim(),
        age,
        gender: details.gender as string,
        nicOrStudentId: typeof details.nicOrStudentId === 'string' ? details.nicOrStudentId.trim() : '',
        mobile: (details.mobile as string).trim(),
        email: typeof details.email === 'string' ? details.email.trim() : '',
        province: typeof details.province === 'string' ? details.province.trim() : '',
        district: (details.district as string).trim(),
        schoolName: (details.schoolName as string).trim(),
        grade: typeof details.grade === 'string' ? details.grade.trim() : '',
        sports: [...new Set(eventEntries.map((event) => event.sportName))],
        selectedEvents: eventEntries,
        isTeamInterest: Boolean(details.isTeamInterest),
        ...(details.teamSquad && typeof details.teamSquad === 'object'
          ? { teamSquad: details.teamSquad as Prisma.InputJsonValue }
          : {}),
        ...(age < 18
          ? {
              guardianName: (details.guardianName as string).trim(),
              guardianRelationship: typeof details.guardianRelationship === 'string'
                ? details.guardianRelationship.trim()
                : '',
              guardianMobile: (details.guardianMobile as string).trim(),
              guardianConsent: true,
            }
          : {}),
        consentTimestamp: new Date().toISOString(),
      };
      const registrationNumber = await generateRegistrationNumber(tx);
      const registrations = await Promise.all(events.map((event) =>
        tx.sportsRegistration.create({
          data: {
            eventId: event.id,
            userId: user.userId,
            status: 'PENDING',
            registrationNumber,
            athleteDetails: athleteDetailsData as Prisma.InputJsonValue,
            paymentStatus: 'PENDING',
            totalAmount,
            notes: typeof details.notes === 'string' ? details.notes.trim() || null : null,
          },
          include: { event: true },
        }),
      ));
      return { kind: 'created' as const, registrations, registrationNumber, totalAmount };
    });

    if (outcome.kind === 'not_found') {
      res.status(404).json({ success: false, message: 'One or more selected sports events were not found.' });
      return;
    }
    if (outcome.kind === 'closed') {
      res.status(409).json({ success: false, message: 'A selected event is no longer accepting registrations.' });
      return;
    }
    if (outcome.kind === 'full') {
      res.status(409).json({ success: false, message: `${outcome.title} has reached its participant limit.` });
      return;
    }
    if (outcome.kind === 'duplicate') {
      res.status(409).json({ success: false, message: 'You are already registered for one or more selected events.' });
      return;
    }
    if (outcome.kind === 'invalid') {
      res.status(400).json({ success: false, message: outcome.message });
      return;
    }

    res.status(201).json({
      success: true,
      data: outcome.registrations,
      registrationNumber: outcome.registrationNumber,
      totalAmount: outcome.totalAmount,
    });
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
      ? req.params.registrationNumber.trim()
      : '';
    const statusMap: Record<string, 'PENDING' | 'CONFIRMED' | 'REJECTED'> = {
      Pending: 'PENDING',
      Approved: 'CONFIRMED',
      Confirmed: 'CONFIRMED',
      Rejected: 'REJECTED',
    };
    const status = typeof req.body.status === 'string' ? statusMap[req.body.status] : undefined;
    if (!registrationNumber || !status) {
      res.status(400).json({ success: false, message: 'Registration number and valid status are required.' });
      return;
    }
    const result = await prisma.$transaction(async (tx) => {
      const registrations = await tx.sportsRegistration.findMany({
        where: { registrationNumber, event: { is: { tenantId } } },
        select: {
          id: true,
          userId: true,
          athleteDetails: true,
        },
      });
      if (registrations.length === 0) return { kind: 'not_found' as const };

      const identities = new Set(registrations.map((registration) => {
        const details = registration.athleteDetails;
        const mobile = details && typeof details === 'object' && !Array.isArray(details)
          ? String((details as Record<string, unknown>).mobile || '').replace(/\D/g, '')
          : '';
        return `${registration.userId}:${mobile}`;
      }));
      if (identities.size !== 1) return { kind: 'ambiguous' as const };

      const updated = await tx.sportsRegistration.updateMany({
        where: { id: { in: registrations.map((registration) => registration.id) } },
        data: { status },
      });
      return { kind: 'updated' as const, count: updated.count };
    });
    if (result.kind === 'not_found') {
      res.status(404).json({ success: false, message: 'Sports registration not found.' });
      return;
    }
    if (result.kind === 'ambiguous') {
      res.status(409).json({ success: false, message: 'Registration reference is ambiguous and was not updated.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: { registrationNumber, status, updatedCount: result.count },
    });
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const teams = await prisma.sportsTeam.findMany({
      where: { tenantId },
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const tournaments = await prisma.sportsTournament.findMany({
      where: { tenantId },
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const fixtures = await prisma.sportsFixture.findMany({
      where: { tenantId },
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
        status: 'UPCOMING',
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
    const parsedHomeScore = parseFixtureScore(homeScore);
    const parsedAwayScore = parseFixtureScore(awayScore);
    if (parsedHomeScore === null || parsedAwayScore === null) {
      res.status(400).json({ success: false, message: 'Scores must begin with a non-negative numeric result.' });
      return;
    }
    const existing = await prisma.sportsFixture.findFirst({
      where: { id, tenantId },
      select: { homeTeam: true, awayTeam: true },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Sports fixture not found.' });
      return;
    }
    const resolvedOutcome = parsedHomeScore === parsedAwayScore
      ? 'Draw'
      : parsedHomeScore > parsedAwayScore
        ? `${existing.homeTeam} won`
        : `${existing.awayTeam} won`;
    const result = await prisma.sportsFixture.updateMany({
      where: { id, tenantId },
      data: {
        homeScore: homeScore.trim(),
        awayScore: awayScore.trim(),
        outcome: resolvedOutcome,
        recordedAt: new Date(),
        status: 'COMPLETED',
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
    const data: Prisma.SportsFixtureUncheckedUpdateInput = {};
    for (const field of ['sportName', 'homeTeam', 'awayTeam', 'venue'] as const) {
      if (body[field] !== undefined && (typeof body[field] !== 'string' || !body[field].trim())) {
        res.status(400).json({ success: false, message: 'Fixture details are invalid.' });
        return;
      }
    }
    if (body.competitionName !== undefined && typeof body.competitionName !== 'string') {
      res.status(400).json({ success: false, message: 'Competition name is invalid.' });
      return;
    }
    if (body.time !== undefined && typeof body.time !== 'string') {
      res.status(400).json({ success: false, message: 'Fixture time is invalid.' });
      return;
    }
    if (body.date !== undefined) {
      const parsed = parseDate(body.date);
      if (!parsed) {
        res.status(400).json({ success: false, message: 'Fixture date is invalid.' });
        return;
      }
      data.date = parsed;
    }
    if (body.status !== undefined) {
      if (!['scheduled', 'in_progress', 'completed'].includes(body.status)) {
        res.status(400).json({ success: false, message: 'Fixture status is invalid.' });
        return;
      }
      data.status = body.status;
    }
    if (body.tournamentId !== undefined) {
      if (body.tournamentId !== null && typeof body.tournamentId !== 'string') {
        res.status(400).json({ success: false, message: 'Tournament selection is invalid.' });
        return;
      }
      if (typeof body.tournamentId === 'string' && body.tournamentId.trim()) {
        const tournament = await prisma.sportsTournament.findFirst({
          where: { id: body.tournamentId, tenantId },
          select: { id: true },
        });
        if (!tournament) {
          res.status(404).json({ success: false, message: 'Tournament not found for this school.' });
          return;
        }
        data.tournamentId = tournament.id;
      } else {
        data.tournamentId = null;
      }
    }
    if (typeof body.sportName === 'string') data.sportName = body.sportName.trim();
    if (typeof body.homeTeam === 'string') data.homeTeam = body.homeTeam.trim();
    if (typeof body.awayTeam === 'string') data.awayTeam = body.awayTeam.trim();
    if (typeof body.competitionName === 'string') data.competitionName = body.competitionName.trim();
    if (typeof body.venue === 'string') data.venue = body.venue.trim();
    if (typeof body.time === 'string') data.time = body.time.trim();
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const fixtures = await prisma.sportsFixture.findMany({
      where: { tenantId, status: 'COMPLETED' },
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
      return score ? parseFixtureScore(score) : null;
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
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;
    const user = req.user;
    if (!user || (user.role !== 'STUDENT' && !sportsManagerRoles.has(user.role))) {
      res.status(403).json({ success: false, message: 'Registration verification is not available for this account.' });
      return;
    }
    const registrationNumber = typeof req.query.registrationNumber === 'string'
      ? req.query.registrationNumber.trim().toUpperCase()
      : '';
    const mobile = typeof req.query.mobile === 'string' ? req.query.mobile.trim() : '';
    if (!registrationNumber || !isValidMobile(mobile)) {
      res.status(400).json({
        success: false,
        message: 'A registration number and valid registered mobile number are required.',
      });
      return;
    }

    const registrations = await prisma.sportsRegistration.findMany({
      where: {
        registrationNumber,
        event: { is: { tenantId } },
        ...(user.role === 'STUDENT' ? { userId: user.userId } : {}),
      },
      include: {
        event: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const normalizedMobile = mobile.replace(/\D/g, '');
    const verifiedRegistrations = registrations.filter((registration) => {
      const details = registration.athleteDetails;
      if (!details || typeof details !== 'object' || Array.isArray(details)) return false;
      return String((details as Record<string, unknown>).mobile || '').replace(/\D/g, '') === normalizedMobile;
    });
    res.status(200).json({ success: true, data: verifiedRegistrations });
  } catch (error: any) {
    console.error('Error verifying sports registration:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
