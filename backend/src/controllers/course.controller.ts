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
 * 1. Create a New Subject / Course
 * POST /api/courses
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, code, description, syllabus, teacherId } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!title || !code) {
      res.status(400).json({
        success: false,
        message: 'Course title and course code are required',
      });
      return;
    }

    const tenantId = user.tenantId;

if (!tenantId) {
  res.status(403).json({
    success: false,
    message: 'A tenant is required to create courses.',
  });
  return;
}

// Check if course code already exists in this tenant
    const existing = await prisma.course.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: code.trim().toUpperCase(),
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `Course with code '${code.trim().toUpperCase()}' already exists in your workspace`,
      });
      return;
    }

    // Determine target teacherProfileId
    let targetTeacherProfileId: string;

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      if (teacherId) {
        targetTeacherProfileId = teacherId;
      } else {
        const adminProfile = await getOrCreateTeacherProfile(user.userId);
        targetTeacherProfileId = adminProfile.id;
      }
    } else {
      // Role is TEACHER
      const teacherProfile = await getOrCreateTeacherProfile(user.userId);
      targetTeacherProfileId = teacherProfile.id;
    }

    const course = await prisma.course.create({
      data: {
        tenantId,
        teacherId: targetTeacherProfileId,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: description ? description.trim() : null,
        syllabus: syllabus || null,
      },
      include: {
        teacher: {
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
        _count: {
          select: { enrollments: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating course',
    });
  }
};

/**
 * 2. Get All Courses (Public or Filtered by Tenant/Search)
 * GET /api/courses
 */
export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, tenantId, teacherId, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNumber - 1) * take;

    const whereClause: any = {};

    if (tenantId) {
      whereClause.tenantId = tenantId as string;
    }

    if (teacherId) {
      whereClause.teacherId = teacherId as string;
    }

    if (search) {
      const searchTerm = (search as string).trim();
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where: whereClause }),
      prisma.course.findMany({
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
          _count: {
            select: { enrollments: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: pageNumber,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error('Error listing courses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while listing courses',
    });
  }
};

/**
 * 3. Get Logged-in Tutor's Courses
 * GET /api/courses/my-courses
 * Restricted to: TEACHER
 */
export const getMyCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    console.error('Error getting tutor courses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching your courses',
    });
  }
};

/**
 * 4. Get Single Course by ID
 * GET /api/courses/:id
 */
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({
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
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching course',
    });
  }
};

/**
 * 5. Update Course
 * PUT /api/courses/:id
 * Restricted to: Course Owner (Teacher) or ADMIN
 */
export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, syllabus, code } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const course: any = await prisma.course.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Authorization: Must be ADMIN or the owner teacher
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (course.teacher?.userId !== user.userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only edit your own courses',
        });
        return;
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (syllabus !== undefined) updateData.syllabus = syllabus;
    if (code !== undefined) updateData.code = code.trim().toUpperCase();

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
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
      },
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating course',
    });
  }
};

/**
 * 6. Delete Course
 * DELETE /api/courses/:id
 * Restricted to: Course Owner (Teacher) or ADMIN
 */
export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const course: any = await prisma.course.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Authorization: Must be ADMIN or the owner teacher
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (course.teacher?.userId !== user.userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only delete your own courses',
        });
        return;
      }
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting course',
    });
  }
};
