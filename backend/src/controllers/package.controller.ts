import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

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

    const teacherProfile = await getOrCreateTeacherProfile(user.userId);
    const tenantId = user.tenantId;

    const packageSlug = slug
      ? slug.trim().toLowerCase()
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

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
          create: (Array.isArray(courseIds) ? courseIds : []).map((courseId: string) => ({
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
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
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
      data: packages,
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

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
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
      data: pkg,
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
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!studentProfile) {
      const studentIdNo = `STU-${user.userId.substring(0, 8).toUpperCase()}`;
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.userId,
          studentIdNo,
          gradeLevel: 'General Batch',
        },
      });
    }

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (pkg.durationDays || 30) * 24 * 60 * 60 * 1000);

    // Create Package Subscription
    const subscription = await prisma.packageSubscription.create({
      data: {
        packageId: id,
        studentId: studentProfile.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        paidAmount: pkg.price,
      },
    });

    // Auto-enroll student into all courses bundled in this package!
    for (const item of pkg.courses) {
      await prisma.enrollment.upsert({
        where: {
          courseId_studentId: {
            courseId: item.courseId,
            studentId: studentProfile.id,
          },
        },
        create: {
          courseId: item.courseId,
          studentId: studentProfile.id,
        },
        update: {},
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to "${pkg.title}"! Course access granted.`,
      data: subscription,
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
