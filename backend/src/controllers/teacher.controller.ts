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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const employeeNo = `TUTOR-${userId.substring(0, 8).toUpperCase()}`;
    await prisma.teacherProfile.create({
      data: {
        userId,
        employeeNo,
        specialization: 'General',
        title: 'Educator & Instructor',
        bio: '',
        mediums: ['English'],
        experienceYears: 0,
        qualifications: [],
        bankName: null,
        bankAccountName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        bankAccountNumber: null,
        bankBranch: null,
        bankBranchCode: null,
        rating: 5.0,
        isVerified: false,
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
      dob: raw.dob || raw.dateOfBirth || '',
      gender: raw.gender || '',
    };
  }
  return {
    qualifications: [],
    accreditations: [],
    bankAccounts: [],
    socialChannels: [],
    dob: '',
    gender: '',
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
        dob: parsedQ.dob,
        gender: parsedQ.gender,
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
      dob,
      gender,
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
    if (qualifications !== undefined || accreditations !== undefined || bankAccounts !== undefined || socialChannels !== undefined || dob !== undefined || gender !== undefined) {
      qualificationsPayload = {
        degrees: qualifications !== undefined ? (Array.isArray(qualifications) ? qualifications : existingQ.qualifications) : existingQ.qualifications,
        accreditations: accreditations !== undefined ? accreditations : existingQ.accreditations,
        bankAccounts: bankAccounts !== undefined ? bankAccounts : existingQ.bankAccounts,
        socialChannels: socialChannels !== undefined ? socialChannels : existingQ.socialChannels,
        dob: dob !== undefined ? dob : (existingQ.dob || ''),
        gender: gender !== undefined ? gender : (existingQ.gender || ''),
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
        dob: parsedUpdated.dob,
        gender: parsedUpdated.gender,
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

/**
 * 4. Get Public Tutor Marketplace Directory
 * GET /api/teachers/marketplace
 * Public / Student facing endpoint (no auth required)
 */
export const getTutorsMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, medium, district, search } = req.query;

    const whereClause: any = {};

    if (subject && typeof subject === 'string' && subject !== 'all') {
      whereClause.OR = [
        { specialization: { contains: subject, mode: 'insensitive' } },
        { title: { contains: subject, mode: 'insensitive' } },
        { bio: { contains: subject, mode: 'insensitive' } },
      ];
    }

    if (medium && typeof medium === 'string' && medium !== 'all') {
      whereClause.mediums = { has: medium };
    }

    if (district && typeof district === 'string' && district !== 'all') {
      whereClause.district = { contains: district, mode: 'insensitive' };
    }

    if (search && typeof search === 'string' && search.trim()) {
      whereClause.OR = [
        { specialization: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const tutors = await prisma.teacherProfile.findMany({
      where: whereClause,
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
            price: true,
            billingCycle: true,
            features: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        _count: {
          select: {
            packages: true,
            courses: true,
            liveClasses: true,
            libraryResources: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    const formatted = tutors.map((t) => {
      const parsedQ = parseQualificationsField(t.qualifications);
      const lowestFee =
        t.packages.length > 0
          ? Math.min(...t.packages.map((p) => p.price))
          : 0;

      return {
        id: t.id,
        userId: t.userId,
        name: `${t.user.firstName} ${t.user.lastName}`.trim(),
        email: t.user.email,
        avatarUrl: t.user.avatarUrl,
        title: t.title || 'Specialist Educator',
        specialization: t.specialization,
        bio: t.bio,
        rating: null, // Only displayed when real student reviews exist
        isVerified: t.isVerified,
        mediums: t.mediums,
        experienceYears: t.experienceYears || 0,
        city: t.city || '',
        district: t.district || '',
        coverImageUrl: t.coverImageUrl,
        publicSlug: t.publicSlug,
        youtubeUrl: t.youtubeUrl,
        whatsappNumber: t.whatsappNumber,
        qualifications: parsedQ.qualifications,
        packagesCount: t._count.packages,
        coursesCount: t._count.courses,
        monthlyFeeLkr: lowestFee,
        packages: t.packages,
        bankName: t.bankName,
        bankAccountName: t.bankAccountName,
        bankAccountNumber: t.bankAccountNumber,
        bankBranch: t.bankBranch,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching tutor marketplace:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Get Authenticated Teacher's Dashboard KPIs, schedule, and recent submissions
 * GET /api/teachers/me/dashboard
 */
export const getMyTeacherDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const teacher = await getOrCreateTeacherProfile(user.userId);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher profile not found' });
      return;
    }
    const teacherId = teacher.id;
    const tenantId = user.tenantId || teacher.user?.tenantId || undefined;

    // 1. Total Enrolled Students (Count active package subscriptions)
    const activeSubscribersCount = await prisma.packageSubscription.count({
      where: {
        package: { teacherId },
        status: 'ACTIVE',
      },
    });

    const totalStudentsInTenant = tenantId
      ? await prisma.studentProfile.count({
          where: { user: { tenantId } },
        })
      : 0;

    const totalEnrolledStudents =
      activeSubscribersCount > 0
        ? activeSubscribersCount
        : totalStudentsInTenant > 0
        ? totalStudentsInTenant
        : 0;

    // 2. Active Batches / Courses
    const coursesCount = await prisma.course.count({
      where: {
        OR: [{ teacherId }, ...(tenantId ? [{ tenantId }] : [])],
      },
    });
    const activeBatchesCount = coursesCount > 0 ? coursesCount : (teacher.courses?.length || 0);

    // 3. Pending Reviews (Assignments submissions waiting to be graded)
    const pendingReviewsCount = await (prisma.assignmentSubmission as any).count({
      where: {
        assignment: {
          OR: [{ teacherId }, ...(tenantId ? [{ tenantId }] : [])],
        },
        status: { in: ['SUBMITTED', 'LATE'] },
      },
    });

    // 4. Live Sessions Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaySessions = await prisma.liveClassSession.findMany({
      where: {
        OR: [{ teacherId }, ...(tenantId ? [{ tenantId }] : [])],
        startTime: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        course: { select: { id: true, title: true } },
        package: { select: { id: true, title: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const liveSessionsTodayCount = todaySessions.length;
    const liveNowSession = todaySessions.find((s) => s.status === 'LIVE');

    // 5. Recent Submissions waiting for review
    const recentSubmissions = await (prisma.assignmentSubmission as any).findMany({
      where: {
        assignment: {
          OR: [{ teacherId }, ...(tenantId ? [{ tenantId }] : [])],
        },
      },
      include: {
        assignment: { select: { id: true, title: true, maxMarks: true, subjectName: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 6,
    });

    // 6. Packages Count
    const packagesCount = await prisma.package.count({
      where: { teacherId },
    });

    res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          name: `${teacher.user?.firstName} ${teacher.user?.lastName || ''}`.trim(),
          specialization: teacher.specialization,
          title: teacher.title,
          avatarUrl: teacher.user?.avatarUrl,
        },
        kpis: {
          totalEnrolledStudents,
          activeBatchesCount,
          pendingReviewsCount,
          liveSessionsTodayCount,
          packagesCount,
        },
        todaySchedule: todaySessions.map((s) => ({
          id: s.id,
          period: s.topic || 'Live Lecture',
          time: `${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
            s.endTime
              ? ' – ' + new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''
          }`,
          course: s.course?.title || s.package?.title || 'Advanced Level Batch',
          courseId: s.courseId || undefined,
          topic: s.title,
          classRoom: s.platform === 'GOOGLE_MEET' ? 'Google Meet Virtual Classroom' : 'Zoom Studio · Stream #01',
          deliveryMode: 'live_online',
          meetingUrl: s.meetingUrl || '',
          meetingId: s.meetingId || '',
          passcode: s.passcode || '',
          status: s.status === 'LIVE' ? 'in_progress' : s.status === 'COMPLETED' ? 'completed' : 'upcoming',
          studentsCount: 0,
        })),
        recentSubmissions: recentSubmissions.map((s: any) => ({
          id: s.id,
          assignmentTitle: s.assignment?.title,
          studentName: s.student?.user
            ? `${s.student.user.firstName} ${s.student.user.lastName || ''}`.trim()
            : 'Student',
          submittedAt: s.submittedAt,
          status: s.status?.toLowerCase(),
          marksObtained: s.marksObtained,
          maxMarks: s.assignment?.maxMarks || 100,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
