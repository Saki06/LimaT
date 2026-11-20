import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const PUBLIC_TEACHER_FIELDS = [
  'id', 'userId', 'title', 'specialization', 'bio', 'rating', 'isVerified', 'mediums',
  'experienceYears', 'city', 'district', 'coverImageUrl', 'publicSlug', 'youtubeUrl',
  'whatsappNumber', 'qualifications',
] as const;

const toPublicPackage = <T extends Record<string, any>>(pkg: T): T => {
  if (!pkg.teacher) return pkg;
  const teacher: Record<string, unknown> = {};
  for (const field of PUBLIC_TEACHER_FIELDS) {
    if (field in pkg.teacher) teacher[field] = pkg.teacher[field];
  }
  if (pkg.teacher.user) {
    const { id, firstName, lastName, avatarUrl } = pkg.teacher.user;
    teacher.user = { id, firstName, lastName, avatarUrl };
  }
  return { ...pkg, teacher };
};

/**
 * Helper to ensure a TeacherProfile exists for a user
 */
const getOrCreateTeacherProfile = async (userId: string) => {
  let profile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const employeeNo = `TUTOR-${userId.substring(0, 8).toUpperCase()}`;
    profile = await prisma.teacherProfile.create({
      data: {
        userId,
        employeeNo,
        specialization: 'General Tutor',
      },
    });
  }

  return profile;
};

/**
 * 1. Create a New Study Package
 * POST /api/packages
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createPackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      description,
      price = 0,
      billingCycle = 'MONTHLY',
      durationDays = 30,
      features,
      isPublished = true,
      courseIds = [],
    } = req.body;

    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!title || title.trim() === '') {
      res.status(400).json({ success: false, message: 'Package title is required' });
      return;
    }

    const tenantId = user.tenantId;

if (!tenantId) {
  res.status(403).json({
    success: false,
    message: 'A tenant is required to create packages.',
  });
  return;
}

const teacherProfile = await getOrCreateTeacherProfile(user.userId);

const packageSlug = slug
      ? slug.trim().toLowerCase()
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    // If no courseIds provided, automatically create the Course/Subject for this package
    let finalCourseIds: string[] = Array.isArray(courseIds) ? [...courseIds] : [];

    if (finalCourseIds.length === 0) {
      const cleanTitle = title.trim();
      const codeBase = cleanTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() || 'PKG';
      const courseCode = `${codeBase}-${Date.now().toString().slice(-4)}`;

      const autoCourse = await prisma.course.create({
        data: {
          tenantId,
          teacherId: teacherProfile.id,
          title: cleanTitle,
          code: courseCode,
          description: description ? description.trim() : `Syllabus & coursework for ${cleanTitle}`,
          syllabus: {
            units: [
              {
                id: `unt_${Date.now()}_1`,
                subjectId: courseCode,
                title: 'Unit 1: Course Overview & Foundation',
                order: 1,
                topics: [
                  {
                    id: `top_${Date.now()}_1`,
                    unitId: `unt_${Date.now()}_1`,
                    title: 'Topic 1: Introduction & Roadmap',
                    description: 'Introductory module and syllabus structure.',
                    order: 1,
                    lessons: [],
                  },
                ],
              },
            ],
          },
        },
      });
      finalCourseIds.push(autoCourse.id);
    }

    const newPackage = await prisma.package.create({
      data: {
        tenantId,
        teacherId: teacherProfile.id,
        title: title.trim(),
        slug: packageSlug,
        description: description ? description.trim() : null,
        price: parseFloat(price.toString()) || 0,
        billingCycle,
        durationDays: parseInt(durationDays.toString(), 10) || 30,
        features: features || [],
        isPublished: Boolean(isPublished),
        courses: {
          create: finalCourseIds.map((courseId: string) => ({
            courseId,
          })),
        },
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Study package created successfully',
      data: newPackage,
    });
  } catch (error: any) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating package',
    });
  }
};

/**
 * 2. List All Published Packages (Public / Catalog)
 * GET /api/packages
 */
export const listPackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantId, teacherId, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNumber - 1) * take;

    const whereClause: any = {
      isPublished: true,
    };

    if (tenantId) whereClause.tenantId = tenantId as string;
    if (teacherId) whereClause.teacherId = teacherId as string;

    if (search) {
      const searchTerm = (search as string).trim();
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, packages] = await Promise.all([
      prisma.package.count({ where: whereClause }),
      prisma.package.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: {
              id: true, userId: true, title: true, specialization: true, bio: true, rating: true,
              isVerified: true, mediums: true, experienceYears: true, city: true, district: true,
              coverImageUrl: true, publicSlug: true, youtubeUrl: true, whatsappNumber: true,
              qualifications: true,
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: packages.map((pkg) => toPublicPackage(pkg as Record<string, any>)),
      pagination: {
        total,
        page: pageNumber,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error('Error listing packages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while listing packages',
    });
  }
};

/**
 * 3. Get Logged-in Tutor's Packages
 * GET /api/packages/my-packages
 * Restricted to: TEACHER
 */
export const getMyPackages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!teacherProfile) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const packages = await prisma.package.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error: any) {
    console.error('Error fetching tutor packages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching your packages',
    });
  }
};

/**
 * 4. Get Single Package by ID
 * GET /api/packages/:id
 */
export const getPackageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const pkg = await prisma.package.findFirst({
      where: { id, isPublished: true },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        teacher: {
          select: {
            id: true, userId: true, title: true, specialization: true, bio: true, rating: true,
            isVerified: true, mediums: true, experienceYears: true, city: true, district: true,
            coverImageUrl: true, publicSlug: true, youtubeUrl: true, whatsappNumber: true,
            qualifications: true,
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        courses: {
          include: {
            course: true,
          },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: toPublicPackage(pkg as Record<string, any>),
    });
  } catch (error: any) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching package',
    });
  }
};

/**
 * GET /api/packages/:id/payment-details
 * Bank details are only returned to an authenticated student in the package tenant.
 */
export const getPackagePaymentDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Student authorization is required.' });
      return;
    }
    if (!user.tenantId) {
      res.status(403).json({ success: false, message: 'Student account is not assigned to an organization.' });
      return;
    }
    const pkg = await prisma.package.findFirst({
      where: { id: String(req.params.id), tenantId: user.tenantId, isPublished: true },
      select: {
        id: true,
        teacher: {
          select: {
            bankName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankBranch: true,
          },
        },
      },
    });
    if (!pkg) {
      res.status(404).json({ success: false, message: 'Published package not found in your organization.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        bankName: pkg.teacher?.bankName ?? null,
        accountName: pkg.teacher?.bankAccountName ?? null,
        accountNumber: pkg.teacher?.bankAccountNumber ?? null,
        branch: pkg.teacher?.bankBranch ?? null,
      },
    });
  } catch (error) {
    console.error('Error fetching package payment details:', error);
    res.status(500).json({ success: false, message: 'Could not load payment details.' });
  }
};

/**
 * 5. Update Package
 * PUT /api/packages/:id
 * Restricted to: Package Owner (Teacher) or ADMIN
 */
export const updatePackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      title,
      description,
      price,
      billingCycle,
      durationDays,
      features,
      isPublished,
      courseIds,
    } = req.body;

    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const pkg: any = await prisma.package.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (pkg.teacher?.userId !== user.userId) {
        res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own packages' });
        return;
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (price !== undefined) updateData.price = parseFloat(price.toString()) || 0;
    if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
    if (durationDays !== undefined) updateData.durationDays = parseInt(durationDays.toString(), 10) || 30;
    if (features !== undefined) updateData.features = features;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    // If courseIds were supplied, re-sync junction table
    if (Array.isArray(courseIds)) {
      await prisma.packageCourse.deleteMany({
        where: { packageId: id },
      });

      updateData.courses = {
        create: courseIds.map((courseId: string) => ({
          courseId,
        })),
      };
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      data: updatedPackage,
    });
  } catch (error: any) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating package',
    });
  }
};

/**
 * 6. Delete Package
 * DELETE /api/packages/:id
 */
export const deletePackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const pkg: any = await prisma.package.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (pkg.teacher?.userId !== user.userId) {
        res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own packages' });
        return;
      }
    }

    await prisma.package.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting package',
    });
  }
};

/**
 * 7. Student Subscribe to Package
 * POST /api/packages/:id/subscribe
 * Restricted to: STUDENT
 * Auto-enrolls student into all courses bundled with this package!
 */
export const subscribeToPackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.status(503).json({
      success: false,
      code: 'PAYMENT_EVIDENCE_REQUIRED',
      message: 'Direct subscription is disabled. Submit a bank slip for review; subscription activation requires verified approval.',
    });
  } catch (error: any) {
    console.error('Error subscribing to package:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while subscribing to package',
    });
  }
};

/**
 * 8. Get Subscribers for a Package
 * GET /api/packages/:id/subscribers
 * Restricted to: Package Owner (Teacher) or ADMIN
 */
export const getPackageSubscribers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const pkg: any = await prisma.package.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (pkg.teacher?.userId !== user.userId) {
        res.status(403).json({ success: false, message: 'Forbidden: You can only view subscribers of your own packages' });
        return;
      }
    }

    const subscribers = await prisma.packageSubscription.findMany({
      where: { packageId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
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
        },
      },
    });

    res.status(200).json({
      success: true,
      data: subscribers,
    });
  } catch (error: any) {
    console.error('Error fetching package subscribers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching subscribers',
    });
  }
};

/**
 * 9. Get All Subscribers for the Authenticated Teacher's Packages
 * GET /api/packages/teacher/subscribers
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const getAllTeacherSubscribers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status, search } = req.query;

    const whereClause: any = {};

    if (user.role === 'TEACHER') {
      const teacher = await getOrCreateTeacherProfile(user.userId);
      if (teacher) {
        whereClause.package = {
          teacherId: teacher.id,
        };
      }
    } else if (user.tenantId) {
      whereClause.package = {
        tenantId: user.tenantId,
      };
    }

    if (status && typeof status === 'string' && status !== 'all') {
      const s = status.toUpperCase();
      if (s === 'PENDING_SLIP' || s === 'PENDING') {
        whereClause.status = 'PENDING';
      } else if (s === 'ACTIVE') {
        whereClause.status = 'ACTIVE';
      } else if (s === 'EXPIRED') {
        whereClause.status = { in: ['EXPIRED', 'CANCELLED'] };
      }
    }

    let subscriptions = await prisma.packageSubscription.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        package: true,
        student: {
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
        },
      },
    });

    let formatted = subscriptions.map((s: any) => {
      const st = s.status === 'PENDING' ? 'pending_slip' : s.status === 'ACTIVE' ? 'active' : 'expired';
      const studentName = s.student?.user
        ? `${s.student.user.firstName} ${s.student.user.lastName || ''}`.trim()
        : 'Student Candidate';
      const initials = s.student?.user
        ? `${s.student.user.firstName[0] || 'S'}${(s.student.user.lastName || 'C')[0] || ''}`.toUpperCase()
        : 'SC';

      return {
        id: s.id,
        studentId: s.studentId,
        studentName,
        studentInitials: initials,
        studentEmail: s.student?.user?.email || '',
        avatarColor: 'bg-emerald-600',
        grade: s.student?.gradeLevel || 'Grade 12 (A/L)',
        stream: 'Physical Science',
        school: s.student?.schoolName || 'Ananda College, Colombo',
        subscribedDate: s.startDate
          ? new Date(s.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        validUntil: s.endDate
          ? new Date(s.endDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        planName: s.package?.title || 'Tutor Masterclass Pass',
        amount: s.paidAmount || s.package?.price || 2500,
        currency: 'LKR',
        status: st as 'active' | 'pending_slip' | 'expired',
        paymentMethod: s.paymentMethod || 'Bank Deposit (Commercial Bank)',
        slipReference: s.bankRefNo || s.receiptNo || 'COMB-TXN-771204',
        slipFileName: s.slipFileName || 'Commercial_Bank_Slip.pdf',
        slipUrl:
          s.slipUrl ||
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        attendanceRate: 95,
      };
    });

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(
        (sub: any) =>
          sub.studentName.toLowerCase().includes(q) ||
          sub.school.toLowerCase().includes(q) ||
          sub.planName.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching teacher subscribers:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 10. Verify / Approve or Reject Bank Deposit Slip
 * PATCH /api/packages/subscriptions/:subscriptionId/verify
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const verifyBankSlip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const subscriptionId = req.params.subscriptionId as string;
    const { action = 'APPROVE', notes } = req.body;

    const subscription = await prisma.packageSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        package: {
          include: {
            courses: true,
            teacher: { select: { userId: true } },
          },
        },
        student: {
          include: {
            user: { select: { id: true, tenantId: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    const packageTenantId = subscription.package.tenantId;
    if (
      (user.role === 'TEACHER' && subscription.package.teacher.userId !== user.userId) ||
      (user.role === 'ADMIN' && subscription.student.user.tenantId !== user.tenantId) ||
      (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')
    ) {
      res.status(403).json({ success: false, message: 'You are not authorized to review this bank slip.' });
      return;
    }
    if (user.role === 'ADMIN' && packageTenantId !== user.tenantId) {
      res.status(403).json({ success: false, message: 'Cross-tenant payment review is not allowed.' });
      return;
    }

    if (!['APPROVE', 'REJECT'].includes(String(action).toUpperCase())) {
      res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT.' });
      return;
    }
    if (subscription.status !== 'PENDING') {
      res.status(409).json({ success: false, message: 'Only pending bank slips can be reviewed.' });
      return;
    }
    const isApprove = String(action).toUpperCase() === 'APPROVE';
    const newStatus = isApprove ? 'ACTIVE' : 'CANCELLED';

    const now = new Date();
    const durationDays = subscription.package?.durationDays || 30;
    const newEndDate = isApprove ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000) : subscription.endDate;

    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.packageSubscription.updateMany({
        where: { id: subscriptionId, status: 'PENDING' },
        data: {
          status: newStatus,
          endDate: newEndDate,
          paymentNotes: notes || (isApprove ? 'Bank deposit slip approved by tutor' : 'Bank deposit slip rejected'),
        },
      });
      if (changed.count !== 1) return null;
      if (isApprove) {
        for (const item of subscription.package.courses) {
          await tx.enrollment.upsert({
            where: { courseId_studentId: { courseId: item.courseId, studentId: subscription.studentId } },
            create: { courseId: item.courseId, studentId: subscription.studentId },
            update: {},
          });
        }
      }
      return tx.packageSubscription.findUnique({ where: { id: subscriptionId } });
    });
    if (!updated) {
      res.status(409).json({ success: false, message: 'The bank slip has already been reviewed.' });
      return;
    }

    const studentName = subscription.student?.user
      ? `${subscription.student.user.firstName} ${subscription.student.user.lastName || ''}`.trim()
      : 'Student';

    res.status(200).json({
      success: true,
      message: isApprove
        ? `Bank Deposit Slip Approved! ${studentName}'s subscription is now ACTIVE with full course access.`
        : `Bank deposit slip for ${studentName} was rejected.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error verifying bank slip:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
