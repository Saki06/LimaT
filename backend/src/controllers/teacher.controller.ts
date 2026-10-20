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
 * Helper to parse extended qualifications JSON safely
 */
const parseQualificationsField = (raw: any) => {
  if (!raw) {
    return {
      qualifications: [],
      accreditations: [],
      bankAccounts: [],
      socialChannels: [],
    };
  }
  if (Array.isArray(raw)) {
    return {
      qualifications: raw,
      accreditations: [],
      bankAccounts: [],
      socialChannels: [],
    };
  }
  if (typeof raw === 'object') {
    return {
      qualifications: Array.isArray(raw.degrees) ? raw.degrees : (Array.isArray(raw.qualifications) ? raw.qualifications : []),
      accreditations: Array.isArray(raw.accreditations) ? raw.accreditations : [],
      bankAccounts: Array.isArray(raw.bankAccounts) ? raw.bankAccounts : [],
      socialChannels: Array.isArray(raw.socialChannels) ? raw.socialChannels : [],
    };
  }
  return {
    qualifications: [],
    accreditations: [],
    bankAccounts: [],
    socialChannels: [],
  };
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

    const parsedQ = parseQualificationsField(profile.qualifications);

    res.status(200).json({
      success: true,
      data: {
        ...profile,
        qualifications: parsedQ.qualifications,
        accreditations: parsedQ.accreditations,
        bankAccounts: parsedQ.bankAccounts,
        socialChannels: parsedQ.socialChannels,
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
      accreditations,
      bankAccounts,
      socialChannels,
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
    const existing = await getOrCreateTeacherProfile(userId);
    const existingQ = parseQualificationsField(existing?.qualifications);

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

    // Merge qualifications object if any extended collection is provided
    let qualificationsPayload: any = undefined;
    if (qualifications !== undefined || accreditations !== undefined || bankAccounts !== undefined || socialChannels !== undefined) {
      qualificationsPayload = {
        degrees: qualifications !== undefined ? (Array.isArray(qualifications) ? qualifications : existingQ.qualifications) : existingQ.qualifications,
        accreditations: accreditations !== undefined ? accreditations : existingQ.accreditations,
        bankAccounts: bankAccounts !== undefined ? bankAccounts : existingQ.bankAccounts,
        socialChannels: socialChannels !== undefined ? socialChannels : existingQ.socialChannels,
      };
    }

    // Sync bank details from primary bank account if bankAccounts array passed
    let finalBankName = bankName;
    let finalBankAccountName = bankAccountName;
    let finalBankAccountNumber = bankAccountNumber;
    let finalBankBranch = bankBranch;
    let finalBankBranchCode = bankBranchCode;

    if (Array.isArray(bankAccounts) && bankAccounts.length > 0) {
      const primary = bankAccounts.find((b: any) => b.isPrimary) || bankAccounts[0];
      if (primary) {
        if (primary.bankName) finalBankName = primary.bankName;
        if (primary.bankAccountName) finalBankAccountName = primary.bankAccountName;
        if (primary.bankAccountNumber) finalBankAccountNumber = primary.bankAccountNumber;
        if (primary.bankBranch) finalBankBranch = primary.bankBranch;
        if (primary.bankBranchCode) finalBankBranchCode = primary.bankBranchCode;
      }
    }

    // Sync social media channels if passed
    let finalYoutube = youtubeUrl;
    let finalTelegram = telegramUrl;
    let finalWhatsapp = whatsappNumber;
    let finalWebsite = websiteUrl;

    if (Array.isArray(socialChannels) && socialChannels.length > 0) {
      const yt = socialChannels.find((s: any) => s.platform?.toLowerCase() === 'youtube');
      if (yt) finalYoutube = yt.url;
      const tg = socialChannels.find((s: any) => s.platform?.toLowerCase() === 'telegram');
      if (tg) finalTelegram = tg.url;
      const wa = socialChannels.find((s: any) => s.platform?.toLowerCase() === 'whatsapp');
      if (wa) finalWhatsapp = wa.url;
      const web = socialChannels.find((s: any) => s.platform?.toLowerCase() === 'website' || s.platform?.toLowerCase() === 'other');
      if (web) finalWebsite = web.url;
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
        ...(qualificationsPayload !== undefined ? { qualifications: qualificationsPayload } : {}),
        ...(finalBankName !== undefined ? { bankName: finalBankName } : {}),
        ...(finalBankAccountName !== undefined ? { bankAccountName: finalBankAccountName } : {}),
        ...(finalBankAccountNumber !== undefined ? { bankAccountNumber: finalBankAccountNumber } : {}),
        ...(finalBankBranch !== undefined ? { bankBranch: finalBankBranch } : {}),
        ...(finalBankBranchCode !== undefined ? { bankBranchCode: finalBankBranchCode } : {}),
        ...(publicSlug !== undefined ? { publicSlug } : {}),
        ...(finalYoutube !== undefined ? { youtubeUrl: finalYoutube } : {}),
        ...(finalTelegram !== undefined ? { telegramUrl: finalTelegram } : {}),
        ...(finalWhatsapp !== undefined ? { whatsappNumber: finalWhatsapp } : {}),
        ...(finalWebsite !== undefined ? { websiteUrl: finalWebsite } : {}),
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

    const parsedUpdated = parseQualificationsField(updatedProfile.qualifications);

    res.status(200).json({
      success: true,
      message: 'Teacher Studio Profile updated successfully',
      data: {
        ...updatedProfile,
        qualifications: parsedUpdated.qualifications,
        accreditations: parsedUpdated.accreditations,
        bankAccounts: parsedUpdated.bankAccounts,
        socialChannels: parsedUpdated.socialChannels,
      },
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

    const parsedQ = parseQualificationsField(profile.qualifications);

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
      qualifications: parsedQ.qualifications,
      accreditations: parsedQ.accreditations,
      socialChannels: parsedQ.socialChannels,
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
