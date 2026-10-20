import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to ensure a TeacherProfile exists for a user
 */
const getOrCreateTeacherProfile = async (userId: string) => {
  let profile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          tenantId: true,
        },
      },
      packages: {
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
          },
        },
      },
      courses: true,
      libraryResources: true,
    },
  });

  if (!profile) {
    const employeeNo = `TUTOR-${userId.substring(0, 8).toUpperCase()}`;
    await prisma.teacherProfile.create({
      data: {
        userId,
        employeeNo,
        specialization: 'Combined Mathematics & Sciences',
        title: 'Lead Specialist Educator & Department Chair',
        bio: 'Specialist Educator with over a decade of teaching excellence preparing students for G.C.E. Advanced Level with distinction.',
        mediums: ['English', 'Sinhala', 'Tamil'],
        experienceYears: 12,
        qualifications: [
          { degree: 'B.Sc. (Hons) in Mathematics', institution: 'University of Colombo', year: '2012', grade: 'First Class' },
          { degree: 'Postgraduate Diploma in Education (PGDE)', institution: 'University of Peradeniya', year: '2015', grade: 'Distinction' },
        ],
        bankName: 'Commercial Bank of Ceylon',
        bankAccountName: 'Samantha Priyantha Perera',
        bankAccountNumber: '8004561234',
        bankBranch: 'Havelock Town',
        bankBranchCode: '042',
        rating: 4.9,
        isVerified: true,
      },
    });

    profile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            tenantId: true,
          },
        },
        packages: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        courses: true,
        libraryResources: true,
      },
    });
  }

  return profile;
};

/**
 * 1. Get Current Teacher Profile & Studio Statistics
 * GET /api/teachers/me
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const getMyTeacherProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const profile = await getOrCreateTeacherProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    // Compute live stats
    let totalSubscribers = 0;
    let monthlyGrossRevenue = 0;

    profile.packages.forEach((pkg) => {
      const activeSubs = pkg.subscriptions?.length || 0;
      totalSubscribers += activeSubs;
      monthlyGrossRevenue += activeSubs * Number(pkg.price || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        ...profile,
        stats: {
          totalSubscribers,
          monthlyGrossRevenue,
          totalPackages: profile.packages.length,
          totalCourses: profile.courses.length,
          totalResources: profile.libraryResources.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ error: 'Failed to fetch teacher profile' });
  }
};

/**
 * 2. Update Current Teacher Profile, Studio Branding & Payout Details
 * PUT /api/teachers/me
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const updateMyTeacherProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const {
      firstName,
      lastName,
      avatarUrl,
      title,
      bio,
      specialization,
      phone,
      address,
      city,
      district,
      province,
      postalCode,
      sltsRegNo,
      mediums,
      experienceYears,
      qualifications,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranch,
      bankBranchCode,
      publicSlug,
      youtubeUrl,
      telegramUrl,
      whatsappNumber,
      websiteUrl,
      coverImageUrl,
    } = req.body;

    // Ensure teacher profile exists
    await getOrCreateTeacherProfile(userId);

    // Update User record if names or avatar provided
    if (firstName !== undefined || lastName !== undefined || avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
      });
    }

    // Check slug uniqueness if provided
    if (publicSlug) {
      const existingSlug = await prisma.teacherProfile.findFirst({
        where: {
          publicSlug,
          NOT: { userId },
        },
      });
      if (existingSlug) {
        res.status(400).json({ error: 'Public studio URL slug is already taken. Please choose another.' });
        return;
      }
    }

    // Update TeacherProfile record
    const updatedProfile = await prisma.teacherProfile.update({
      where: { userId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(specialization !== undefined ? { specialization } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(province !== undefined ? { province } : {}),
        ...(postalCode !== undefined ? { postalCode } : {}),
        ...(sltsRegNo !== undefined ? { sltsRegNo } : {}),
        ...(mediums !== undefined ? { mediums } : {}),
        ...(experienceYears !== undefined ? { experienceYears: Number(experienceYears) || 0 } : {}),
        ...(qualifications !== undefined ? { qualifications } : {}),
        ...(bankName !== undefined ? { bankName } : {}),
        ...(bankAccountName !== undefined ? { bankAccountName } : {}),
        ...(bankAccountNumber !== undefined ? { bankAccountNumber } : {}),
        ...(bankBranch !== undefined ? { bankBranch } : {}),
        ...(bankBranchCode !== undefined ? { bankBranchCode } : {}),
        ...(publicSlug !== undefined ? { publicSlug } : {}),
        ...(youtubeUrl !== undefined ? { youtubeUrl } : {}),
        ...(telegramUrl !== undefined ? { telegramUrl } : {}),
        ...(whatsappNumber !== undefined ? { whatsappNumber } : {}),
        ...(websiteUrl !== undefined ? { websiteUrl } : {}),
        ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            tenantId: true,
          },
        },
        packages: true,
        courses: true,
        libraryResources: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Teacher Studio Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ error: 'Failed to update teacher profile' });
  }
};

/**
 * 3. Get Public Tutor Studio Page (Student/Visitor Facing)
 * GET /api/teachers/public/:slugOrId
 * Public endpoint (no auth required)
 */
export const getPublicTutorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const slugOrId = String(req.params.slugOrId);

    const profile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { publicSlug: slugOrId },
          { id: slugOrId },
          { userId: slugOrId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
        packages: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            billingCycle: true,
            durationDays: true,
            features: true,
          },
        },
        libraryResources: {
          where: {
            status: 'published',
            visibility: 'PUBLIC',
          },
          select: {
            id: true,
            title: true,
            description: true,
            resourceType: true,
            subject: true,
            category: true,
            year: true,
            viewsCount: true,
            downloadsCount: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Tutor studio profile not found' });
      return;
    }

    // Sanitize sensitive banking info for public view
    const publicData = {
      id: profile.id,
      userId: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
      avatarUrl: profile.user.avatarUrl,
      title: profile.title || 'Specialist Educator',
      specialization: profile.specialization,
      bio: profile.bio,
      rating: profile.rating,
      isVerified: profile.isVerified,
      mediums: profile.mediums,
      experienceYears: profile.experienceYears,
      qualifications: profile.qualifications,
      publicSlug: profile.publicSlug,
      youtubeUrl: profile.youtubeUrl,
      telegramUrl: profile.telegramUrl,
      whatsappNumber: profile.whatsappNumber,
      websiteUrl: profile.websiteUrl,
      coverImageUrl: profile.coverImageUrl,
      packages: profile.packages,
      publicResources: profile.libraryResources,
    };

    res.status(200).json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error('Error fetching public tutor profile:', error);
    res.status(500).json({ error: 'Failed to fetch public tutor profile' });
  }
};
