import { Response } from 'express';
import { Prisma } from '@prisma/client';
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

/**
 * Get athlete profile
 */
export const getAthleteProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, message: 'User ID is required.' });
      return;
    }

    const profile = await prisma.athleteProfile.findFirst({
      where: { userId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Athlete profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching athlete profile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get my athlete profile
 */
export const getMyAthleteProfile = async (
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

    const profile = await prisma.athleteProfile.findFirst({
      where: { userId: user.userId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Athlete profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching my athlete profile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Create or update athlete profile
 */
export const upsertAthleteProfile = async (
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

    const {
      dateOfBirth,
      gender,
      schoolName,
      province,
      district,
      height,
      weight,
      bloodType,
      emergencyContact,
      sportsInterests,
      isTeamInterested,
      bio,
      profileImageUrl,
    } = req.body;

    // Validate inputs
    if (gender && !['Boys', 'Girls', 'Mixed'].includes(gender)) {
      res.status(400).json({ success: false, message: 'Gender must be Boys, Girls, or Mixed.' });
      return;
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) {
        res.status(400).json({ success: false, message: 'Date of birth is invalid.' });
        return;
      }
    }

    if (height && (typeof height !== 'number' || height < 1 || height > 300)) {
      res.status(400).json({ success: false, message: 'Height must be between 1 and 300 cm.' });
      return;
    }

    if (weight && (typeof weight !== 'number' || weight < 1 || weight > 500)) {
      res.status(400).json({ success: false, message: 'Weight must be between 1 and 500 kg.' });
      return;
    }

    // Check if profile exists
    const existing = await prisma.athleteProfile.findUnique({
      where: { userId: user.userId },
    });

    const profileData: any = {
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender }),
      ...(schoolName && { schoolName: schoolName.trim() }),
      ...(province && { province: province.trim() }),
      ...(district && { district: district.trim() }),
      ...(height !== undefined && { height }),
      ...(weight !== undefined && { weight }),
      ...(bloodType && { bloodType: bloodType.trim() }),
      ...(emergencyContact && { emergencyContact: emergencyContact.trim() }),
      ...(Array.isArray(sportsInterests) && { sportsInterests }),
      ...(isTeamInterested !== undefined && { isTeamInterested: Boolean(isTeamInterested) }),
      ...(bio && { bio: bio.trim() }),
      ...(profileImageUrl && { profileImageUrl }),
    };

    let profile;
    if (existing) {
      profile = await prisma.athleteProfile.update({
        where: { userId: user.userId },
        data: profileData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else {
      profile = await prisma.athleteProfile.create({
        data: {
          tenantId,
          userId: user.userId,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          schoolName: schoolName ? schoolName.trim() : null,
          province: province ? province.trim() : null,
          district: district ? district.trim() : null,
          height,
          weight,
          bloodType: bloodType ? bloodType.trim() : null,
          emergencyContact: emergencyContact ? emergencyContact.trim() : null,
          sportsInterests: Array.isArray(sportsInterests) ? sportsInterests : [],
          isTeamInterested: Boolean(isTeamInterested),
          bio: bio ? bio.trim() : null,
          profileImageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error upserting athlete profile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * List athletes by sport interest
 */
export const listAthletesByInterest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { sport, page = 1, limit = 20 } = req.query;

    if (!sport || typeof sport !== 'string') {
      res.status(400).json({ success: false, message: 'Sport interest is required.' });
      return;
    }

    const pageNum = Math.max(1, Number.parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [athletes, total] = await Promise.all([
      prisma.athleteProfile.findMany({
        where: {
          tenantId,
          sportsInterests: { has: sport.trim() },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.athleteProfile.count({
        where: {
          tenantId,
          sportsInterests: { has: sport.trim() },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: athletes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error listing athletes by interest:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Add achievement to athlete profile
 */
export const addAthleteAchievement = async (
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

    const { title, description, date, category } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'Achievement title is required.' });
      return;
    }

    const profile = await prisma.athleteProfile.findFirst({
      where: { userId: user.userId, tenantId },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Athlete profile not found.' });
      return;
    }

    const achievements = Array.isArray(profile.achievements) ? profile.achievements : [];
    const newAchievement = {
      id: `ach-${Date.now()}`,
      title: title.trim(),
      description: description ? (description as string).trim() : null,
      date: date || new Date().toISOString(),
      category: category || 'General',
      createdAt: new Date().toISOString(),
    };

    achievements.push(newAchievement);

    const updated = await prisma.athleteProfile.update({
      where: { userId: user.userId },
      data: { achievements: achievements as Prisma.InputJsonValue },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error adding athlete achievement:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Add participation history record
 */
export const addParticipationRecord = async (
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

    const { eventName, sport, position, team, date, result } = req.body;

    if (!eventName || typeof eventName !== 'string' || !eventName.trim()) {
      res.status(400).json({ success: false, message: 'Event name is required.' });
      return;
    }

    const profile = await prisma.athleteProfile.findFirst({
      where: { userId: user.userId, tenantId },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Athlete profile not found.' });
      return;
    }

    const history = Array.isArray(profile.participationHistory) ? profile.participationHistory : [];
    const record = {
      id: `par-${Date.now()}`,
      eventName: eventName.trim(),
      sport: sport || 'Unknown',
      position: position || null,
      team: team || null,
      date: date || new Date().toISOString(),
      result: result || null,
      createdAt: new Date().toISOString(),
    };

    history.push(record);

    const updated = await prisma.athleteProfile.update({
      where: { userId: user.userId },
      data: { participationHistory: history as Prisma.InputJsonValue },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error adding participation record:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get sports locations (provinces and districts)
 */
export const getSportsLocations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const tenantId = requireSportsTenant(req, res);
    if (!tenantId) return;

    const { type } = req.query;

    const where: Prisma.SportsLocationWhereInput = {
      tenantId,
      isActive: true,
    };

    if (type && (type === 'PROVINCE' || type === 'DISTRICT')) {
      where.type = type as any;
    }

    const locations = await prisma.sportsLocation.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.status(200).json({ success: true, data: locations });
  } catch (error: any) {
    console.error('Error fetching sports locations:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Seed sports locations with Sri Lankan data (admin only)
 */
export const seedSportsLocations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Admin access is required.' });
      return;
    }

    const tenantId = getTenantId(req);
    if (!tenantId) {
      res.status(403).json({ success: false, message: 'A tenant account is required.' });
      return;
    }

    // Sri Lankan provinces
    const provinces = [
      { name: 'Western Province', code: 'WP' },
      { name: 'Central Province', code: 'CP' },
      { name: 'Southern Province', code: 'SP' },
      { name: 'Northern Province', code: 'NP' },
      { name: 'Eastern Province', code: 'EP' },
      { name: 'North Western Province', code: 'NWP' },
      { name: 'North Central Province', code: 'NCP' },
      { name: 'Sabaragamuwa Province', code: 'SBP' },
      { name: 'Uva Province', code: 'UP' },
    ];

    // Sri Lankan districts
    const districts = [
      // Western Province
      { name: 'Colombo', code: 'CLO', province: 'WP' },
      { name: 'Gampaha', code: 'GAM', province: 'WP' },
      { name: 'Kalutara', code: 'KAL', province: 'WP' },
      // Central Province
      { name: 'Kandy', code: 'KAN', province: 'CP' },
      { name: 'Matara', code: 'MAT', province: 'CP' },
      { name: 'Nuwara Eliya', code: 'NUW', province: 'CP' },
      // Southern Province
      { name: 'Galle', code: 'GAL', province: 'SP' },
      { name: 'Matara', code: 'MAT', province: 'SP' },
      { name: 'Hambantota', code: 'HAM', province: 'SP' },
      // Northern Province
      { name: 'Jaffna', code: 'JAF', province: 'NP' },
      { name: 'Mullaitivu', code: 'MUL', province: 'NP' },
      { name: 'Vavuniya', code: 'VAV', province: 'NP' },
      // Eastern Province
      { name: 'Trincomalee', code: 'TRI', province: 'EP' },
      { name: 'Batticaloa', code: 'BAT', province: 'EP' },
      { name: 'Ampara', code: 'AMP', province: 'EP' },
      // North Western Province
      { name: 'Kurunegala', code: 'KUR', province: 'NWP' },
      { name: 'Puttalam', code: 'PUT', province: 'NWP' },
      // North Central Province
      { name: 'Anuradhapura', code: 'ANU', province: 'NCP' },
      { name: 'Polonnaruwa', code: 'POL', province: 'NCP' },
      // Sabaragamuwa Province
      { name: 'Ratnapura', code: 'RAT', province: 'SBP' },
      { name: 'Kegalle', code: 'KEG', province: 'SBP' },
      // Uva Province
      { name: 'Badulla', code: 'BAD', province: 'UP' },
      { name: 'Monaragala', code: 'MON', province: 'UP' },
    ];

    // Clear existing locations
    await prisma.sportsLocation.deleteMany({ where: { tenantId } });

    // Seed provinces
    await Promise.all(
      provinces.map((prov, idx) =>
        prisma.sportsLocation.create({
          data: {
            tenantId,
            type: 'PROVINCE',
            name: prov.name,
            code: prov.code,
            order: idx,
          },
        }),
      ),
    );

    // Seed districts
    await Promise.all(
      districts.map((dist, idx) =>
        prisma.sportsLocation.create({
          data: {
            tenantId,
            type: 'DISTRICT',
            name: dist.name,
            code: dist.code,
            order: idx,
          },
        }),
      ),
    );

    const createdLocations = await prisma.sportsLocation.findMany({ where: { tenantId } });

    res.status(200).json({
      success: true,
      message: 'Sports locations seeded successfully.',
      data: { locationsCount: createdLocations.length },
    });
  } catch (error: any) {
    console.error('Error seeding sports locations:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const getTenantIdHelper = (req: AuthenticatedRequest): string | null => req.user?.tenantId ?? null;
