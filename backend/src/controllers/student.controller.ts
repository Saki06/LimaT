import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to ensure a StudentProfile exists for the authenticated user
 */
const getOrCreateStudentProfile = async (userId: string) => {
  let profile = await prisma.studentProfile.findUnique({
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
      guardian: {
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

  if (!profile) {
    const studentIdNo = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
    await prisma.studentProfile.create({
      data: {
        userId,
        studentIdNo,
        gradeLevel: 'Grade 12',
        section: 'Physical Sciences & Technology',
      },
    });

    profile = await prisma.studentProfile.findUnique({
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
        guardian: {
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
  }

  return profile;
};

/**
 * 1. Get Current Student Profile
 * GET /api/students/me
 */
export const getMyStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Counts for summary
    const [enrolledCoursesCount, activePackagesCount, submissionsCount] = await Promise.all([
      prisma.enrollment.count({ where: { studentId: profile.id } }),
      prisma.packageSubscription.count({ where: { studentId: profile.id, status: 'ACTIVE' } }),
      prisma.assignmentSubmission.count({ where: { studentId: profile.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...profile,
        stats: {
          enrolledCoursesCount,
          activePackagesCount,
          submissionsCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in getMyStudentProfile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Update Current Student Profile
 * PUT /api/students/me
 */
export const updateMyStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { firstName, lastName, avatarUrl, gradeLevel, section } = req.body;

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

    // Update StudentProfile record
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        studentIdNo: `STU-${Math.floor(10000 + Math.random() * 90000)}`,
        gradeLevel: gradeLevel || 'Grade 12',
        section: section || 'Physical Sciences',
      },
      update: {
        ...(gradeLevel !== undefined ? { gradeLevel } : {}),
        ...(section !== undefined ? { section } : {}),
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
      },
    });

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in updateMyStudentProfile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Get Student Dashboard Overview Cockpit Data
 * GET /api/students/dashboard
 */
export const getStudentDashboardOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const studentId = profile.id;
    const tenantId = req.user?.tenantId;

    // 1. Enrolled Courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // 2. Active Package Subscriptions
    const activeSubscriptions = await prisma.packageSubscription.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        package: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            courses: {
              include: { course: true },
            },
          },
        },
      },
    });

    const subscribedPackageIds = activeSubscriptions.map((s) => s.packageId);

    // 3. Upcoming Live Classes
    const upcomingLiveClasses = await prisma.liveClassSession.findMany({
      where: {
        OR: [
          { courseId: { in: enrolledCourseIds } },
          { packageId: { in: subscribedPackageIds } },
          ...(tenantId ? [{ tenantId }] : []),
        ],
        startTime: { gte: new Date(Date.now() - 3600000) }, // from 1 hour ago into future
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        course: {
          select: { id: true, title: true, code: true },
        },
        package: {
          select: { id: true, title: true },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 6,
    });

    // 4. Pending Assignments (Assignments in student courses where student hasn't submitted yet)
    const existingSubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId },
      select: { assignmentId: true, marksObtained: true, status: true },
    });
    const submittedAssignmentIds = existingSubmissions.map((s) => s.assignmentId);

    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
        status: 'PUBLISHED',
        id: { notIn: submittedAssignmentIds },
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // 5. Recent Submissions with marks
    const recentSubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
            subjectName: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    // 6. Metrics Calculations
    const gradedSubmissions = existingSubmissions.filter(
      (s) => s.marksObtained !== null && s.marksObtained !== undefined
    );
    const averageScore =
      gradedSubmissions.length > 0
        ? Math.round(
            gradedSubmissions.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) /
              gradedSubmissions.length
          )
        : 88; // friendly baseline if fresh student

    const totalLiveAttendances = await prisma.liveClassAttendance.count({
      where: { studentId },
    });

    const metrics = {
      enrolledCoursesCount: enrollments.length,
      activePackagesCount: activeSubscriptions.length,
      upcomingLiveClassesCount: upcomingLiveClasses.length,
      pendingAssignmentsCount: pendingAssignments.length,
      submittedAssignmentsCount: existingSubmissions.length,
      attendanceSessionsCount: totalLiveAttendances,
      averageScore,
      attendanceRate: 94, // baseline %
    };

    res.status(200).json({
      success: true,
      data: {
        student: profile,
        metrics,
        enrollments,
        activeSubscriptions,
        upcomingLiveClasses,
        pendingAssignments,
        recentSubmissions,
      },
    });
  } catch (error: any) {
    console.error('Error in getStudentDashboardOverview:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Get Student's Enrolled Courses & Learning Progress
 * GET /api/students/my-courses
 */
export const getMyCourses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // 1. Direct course enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profile.id },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    email: true,
                  },
                },
              },
            },
            assignments: {
              select: { id: true, title: true, dueDate: true, maxMarks: true },
            },
            liveClasses: {
              where: { status: { in: ['SCHEDULED', 'LIVE'] } },
              take: 3,
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // 2. Courses from active tuition package subscriptions
    const activeSubs = await prisma.packageSubscription.findMany({
      where: {
        studentId: profile.id,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        package: {
          include: {
            courses: {
              include: {
                course: {
                  include: {
                    teacher: {
                      include: {
                        user: {
                          select: {
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                            email: true,
                          },
                        },
                      },
                    },
                    assignments: {
                      select: { id: true, title: true, dueDate: true, maxMarks: true },
                    },
                    liveClasses: {
                      where: { status: { in: ['SCHEDULED', 'LIVE'] } },
                      take: 3,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Map unique courses
    const directCourseList = enrollments.map((e) => ({
      ...e.course,
      enrolledAt: e.enrolledAt,
      grade: e.grade,
      enrollmentType: 'DIRECT',
    }));

    const packageCourseList: any[] = [];
    activeSubs.forEach((sub) => {
      sub.package.courses.forEach((pc) => {
        if (!directCourseList.some((dc) => dc.id === pc.course.id)) {
          packageCourseList.push({
            ...pc.course,
            enrolledAt: sub.startDate,
            grade: null,
            enrollmentType: 'PACKAGE',
            packageName: sub.package.title,
            packageId: sub.package.id,
          });
        }
      });
    });

    const allCourses = [...directCourseList, ...packageCourseList];

    res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error: any) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Self-Enroll Student into a Course
 * POST /api/students/courses/:courseId/enroll
 */
export const enrollInCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const courseId = String(req.params.courseId);
    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Check existing enrollment
    const existing = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: profile.id,
        },
      },
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message: 'You are already enrolled in this course',
        data: existing,
      });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId: profile.id,
      },
      include: {
        course: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Enrolled successfully in ${course.title}`,
      data: enrollment,
    });
  } catch (error: any) {
    console.error('Error in enrollInCourse:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Get Student's Subscribed Tuition Packages
 * GET /api/students/my-packages
 */
export const getMyPackages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const subscriptions = await prisma.packageSubscription.findMany({
      where: { studentId: profile.id },
      include: {
        package: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    email: true,
                  },
                },
              },
            },
            courses: {
              include: {
                course: {
                  select: { id: true, title: true, code: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    console.error('Error in getMyPackages:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 7. Subscribe Student to a Tuition Package
 * POST /api/students/packages/:packageId/subscribe
 */
export const subscribePackage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const packageId = String(req.params.packageId);
    const profile = await getOrCreateStudentProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        courses: true,
      },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }

    const durationDays = pkg.durationDays || 30;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const subscription = await prisma.packageSubscription.create({
      data: {
        packageId,
        studentId: profile.id,
        startDate,
        endDate,
        paidAmount: Number(pkg.price || 0),
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    // Automatically enroll student in all courses included in this package
    if (pkg.courses && pkg.courses.length > 0) {
      await Promise.all(
        pkg.courses.map((pc) =>
          prisma.enrollment.upsert({
            where: {
              courseId_studentId: {
                courseId: pc.courseId,
                studentId: profile.id,
              },
            },
            create: {
              courseId: pc.courseId,
              studentId: profile.id,
            },
            update: {},
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      message: `Subscribed successfully to ${pkg.title}`,
      data: subscription,
    });
  } catch (error: any) {
    console.error('Error in subscribePackage:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

