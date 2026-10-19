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
 * 1. Create a New Live Class Session
 * POST /api/live-classes
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createLiveClass = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      topic,
      courseId,
      packageId,
      startTime,
      durationMinutes = 60,
      platform = 'JITSI',
      meetingUrl,
      meetingId,
      passcode,
      recordingUrl,
    } = req.body;

    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!title || title.trim() === '') {
      res.status(400).json({ success: false, message: 'Live class title is required' });
      return;
    }

    if (!startTime) {
      res.status(400).json({ success: false, message: 'Class start time is required' });
      return;
    }

    const teacherProfile = await getOrCreateTeacherProfile(user.userId);
    const tenantId = user.tenantId;

    // Generate room identifier if JITSI and no URL is provided
    let finalMeetingUrl = meetingUrl;
    let finalMeetingId = meetingId;
    if (platform === 'JITSI') {
      const roomSlug = `limat-${tenantId.substring(0, 6)}-${Math.random().toString(36).substring(2, 9)}`;
      finalMeetingId = meetingId || roomSlug;
      finalMeetingUrl = meetingUrl || `https://meet.jit.si/${finalMeetingId}`;
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const liveSession = await prisma.liveClassSession.create({
      data: {
        tenantId,
        teacherId: teacherProfile.id,
        courseId: courseId || null,
        packageId: packageId || null,
        title,
        description: description || null,
        topic: topic || null,
        startTime: startDateTime,
        endTime: endDateTime,
        durationMinutes: Number(durationMinutes) || 60,
        platform: platform || 'JITSI',
        meetingUrl: finalMeetingUrl || null,
        meetingId: finalMeetingId || null,
        passcode: passcode || null,
        recordingUrl: recordingUrl || null,
        status: 'SCHEDULED',
      },
      include: {
        teacher: {
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
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        package: {
          select: {
            id: true,
            title: true,
            price: true,
            billingCycle: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Live class session scheduled successfully',
      data: liveSession,
    });
  } catch (error: any) {
    console.error('Error creating live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule live class',
      error: error.message,
    });
  }
};

/**
 * 2. Get Live Class Sessions (Filtered by role / tenant)
 * GET /api/live-classes
 */
export const getLiveClasses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const tenantId = user.tenantId;
    const { status, courseId, packageId } = req.query;

    const whereClause: any = {
      tenantId,
    };

    if (status) {
      whereClause.status = status as string;
    }
    if (courseId) {
      whereClause.courseId = courseId as string;
    }
    if (packageId) {
      whereClause.packageId = packageId as string;
    }

    // Role-specific scoping
    if (user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.userId },
      });
      if (teacherProfile) {
        whereClause.teacherId = teacherProfile.id;
      }
    }

    const liveClasses = await prisma.liveClassSession.findMany({
      where: whereClause,
      include: {
        teacher: {
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
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        package: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      count: liveClasses.length,
      data: liveClasses,
    });
  } catch (error: any) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve live classes',
      error: error.message,
    });
  }
};

/**
 * 3. Get Single Live Class Session by ID
 * GET /api/live-classes/:id
 */
export const getLiveClassById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const liveSession = await prisma.liveClassSession.findUnique({
      where: { id },
      include: {
        teacher: {
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
          },
        },
        course: true,
        package: true,
        attendances: {
          include: {
            student: {
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
              },
            },
          },
        },
      },
    });

    if (!liveSession) {
      res.status(404).json({ success: false, message: 'Live class session not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: liveSession,
    });
  } catch (error: any) {
    console.error('Error fetching live class session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve live class session',
      error: error.message,
    });
  }
};

/**
 * 4. Update Live Class Session
 * PUT /api/live-classes/:id
 */
export const updateLiveClass = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      topic,
      courseId,
      packageId,
      startTime,
      durationMinutes,
      platform,
      meetingUrl,
      meetingId,
      passcode,
      recordingUrl,
      status,
    } = req.body;

    const existing = await prisma.liveClassSession.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Live class session not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (topic !== undefined) updateData.topic = topic;
    if (courseId !== undefined) updateData.courseId = courseId || null;
    if (packageId !== undefined) updateData.packageId = packageId || null;
    if (durationMinutes !== undefined) updateData.durationMinutes = Number(durationMinutes);
    if (platform !== undefined) updateData.platform = platform;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (meetingId !== undefined) updateData.meetingId = meetingId;
    if (passcode !== undefined) updateData.passcode = passcode;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;
    if (status !== undefined) updateData.status = status;

    if (startTime) {
      const startDateTime = new Date(startTime);
      updateData.startTime = startDateTime;
      const duration = durationMinutes ? Number(durationMinutes) : existing.durationMinutes;
      updateData.endTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    }

    const updated = await prisma.liveClassSession.update({
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
        course: true,
        package: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live class',
      error: error.message,
    });
  }
};

/**
 * 5. Update Status (START / END / CANCEL Live Class)
 * PATCH /api/live-classes/:id/status
 */
export const updateLiveClassStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // SCHEDULED, LIVE, COMPLETED, CANCELLED

    if (!['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be SCHEDULED, LIVE, COMPLETED, or CANCELLED',
      });
      return;
    }

    const updated = await prisma.liveClassSession.update({
      where: { id },
      data: { status },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        course: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Live class status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating live class status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live class status',
      error: error.message,
    });
  }
};

/**
 * 6. Delete Live Class
 * DELETE /api/live-classes/:id
 */
export const deleteLiveClass = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.liveClassSession.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Live class session deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete live class',
      error: error.message,
    });
  }
};

/**
 * 7. Student Join Live Class & Record Attendance
 * POST /api/live-classes/:id/join
 */
export const joinLiveClass = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await prisma.liveClassSession.findUnique({
      where: { id },
      include: {
        course: true,
        package: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ success: false, message: 'Live class session not found' });
      return;
    }

    // If user is a student, record or update attendance
    if (user.role === 'STUDENT') {
      let studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.userId },
      });

      if (!studentProfile) {
        studentProfile = await prisma.studentProfile.create({
          data: {
            userId: user.userId,
            studentIdNo: `STU-${user.userId.substring(0, 8).toUpperCase()}`,
            gradeLevel: 'Advanced',
          },
        });
      }

      await prisma.liveClassAttendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: studentProfile.id,
          },
        },
        create: {
          sessionId: session.id,
          studentId: studentProfile.id,
          joinedAt: new Date(),
        },
        update: {
          leftAt: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Joined live class session successfully',
      data: {
        sessionId: session.id,
        title: session.title,
        status: session.status,
        platform: session.platform,
        meetingUrl: session.meetingUrl,
        meetingId: session.meetingId,
        passcode: session.passcode,
      },
    });
  } catch (error: any) {
    console.error('Error joining live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join live class',
      error: error.message,
    });
  }
};
