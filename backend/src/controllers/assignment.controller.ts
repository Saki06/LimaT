import { Response } from 'express';
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
 * Helper to ensure a StudentProfile exists for a user
 */
const getOrCreateStudentProfile = async (userId: string) => {
  let profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const studentIdNo = `STU-${userId.substring(0, 8).toUpperCase()}`;
    profile = await prisma.studentProfile.create({
      data: {
        userId,
        studentIdNo,
        gradeLevel: 'Grade 12',
      },
    });
  }

  return profile;
};

/**
 * 1. Create a New Assignment
 * POST /api/assignments
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      instructions,
      courseId,
      subjectName,
      topicName,
      dueDate,
      maxMarks = 100,
      status = 'PUBLISHED',
      attachmentUrl,
      attachmentName,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Assignment title is required' });
      return;
    }

    const teacher = await getOrCreateTeacherProfile(user.userId);

    // Validate courseId if provided
    let finalCourseId: string | null = null;
    let resolvedSubjectName = subjectName;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        finalCourseId = course.id;
        if (!resolvedSubjectName) {
          resolvedSubjectName = course.title;
        }
      }
    }

    let parsedDueDate: Date | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        parsedDueDate = d;
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        tenantId: user.tenantId,
        teacherId: teacher.id,
        courseId: finalCourseId,
        subjectName: resolvedSubjectName || 'Combined Mathematics',
        title: title.trim(),
        instructions: instructions?.trim() || null,
        topicName: topicName?.trim() || 'General Topic',
        dueDate: parsedDueDate,
        maxMarks: Number(maxMarks) || 100,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        ...assignment,
        submissionsCount: 0,
        pendingReviewCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Get All Assignments (Filtered by tenant, course, role)
 * GET /api/assignments
 */
export const getAssignments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { courseId, status, subjectName, search } = req.query;

    const whereClause: any = {
      tenantId: user.tenantId,
    };

    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    } else if (user.role === 'STUDENT') {
      whereClause.status = 'PUBLISHED';
    }

    if (courseId && typeof courseId === 'string') {
      whereClause.courseId = courseId;
    }

    if (subjectName && typeof subjectName === 'string') {
      whereClause.subjectName = {
        contains: subjectName,
        mode: 'insensitive',
      };
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topicName: { contains: search, mode: 'insensitive' } },
        { instructions: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If teacher, optionally filter by teacher's profile
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.userId },
      });
      if (teacher) {
        whereClause.teacherId = teacher.id;
      }
    }

    // For student, identify student profile
    let studentProfileId: string | null = null;
    if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.userId },
      });
      if (student) {
        studentProfileId = student.id;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            status: true,
            marksObtained: true,
            teacherFeedback: true,
            submittedAt: true,
            markedAt: true,
            textContent: true,
            fileAttachmentName: true,
            fileAttachmentUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = assignments.map((asg: any) => {
      const totalSubs = asg.submissions?.length || 0;
      const pendingReview = asg.submissions?.filter((s: any) => s.marksObtained === null || s.marksObtained === undefined).length || 0;
      const mySubmission = studentProfileId
        ? asg.submissions?.find((s: any) => s.studentId === studentProfileId) || null
        : null;

      return {
        id: asg.id,
        courseId: asg.courseId || '',
        subjectName: asg.subjectName || asg.course?.title || 'Combined Mathematics',
        title: asg.title,
        instructions: asg.instructions || '',
        topicName: asg.topicName || 'General Topic',
        maxMarks: asg.maxMarks,
        dueDate: asg.dueDate ? asg.dueDate.toISOString() : '',
        status: asg.status.toLowerCase(),
        attachmentName: asg.attachmentName || undefined,
        attachmentUrl: asg.attachmentUrl || undefined,
        submissionsCount: totalSubs,
        pendingReviewCount: pendingReview,
        teacherName: asg.teacher?.user ? `${asg.teacher.user.firstName} ${asg.teacher.user.lastName}` : 'Teacher',
        createdAt: asg.createdAt.toISOString(),
        mySubmission,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Get Single Assignment by ID
 * GET /api/assignments/:id
 */
export const getAssignmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        submissions: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment || assignment.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    // If student, filter out other students' submissions
    let filteredSubmissions = assignment.submissions;
    if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.userId },
      });
      filteredSubmissions = assignment.submissions.filter((s: any) => s.studentId === student?.id);
    }

    res.status(200).json({
      success: true,
      data: {
        ...assignment,
        submissions: filteredSubmissions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching assignment by id:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Update Assignment
 * PUT /api/assignments/:id
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const updateAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    const {
      title,
      instructions,
      courseId,
      subjectName,
      topicName,
      dueDate,
      maxMarks,
      status,
      attachmentUrl,
      attachmentName,
    } = req.body;

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing || existing.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    let finalCourseId: string | null = existing.courseId;
    let resolvedSubjectName = subjectName !== undefined ? subjectName : existing.subjectName;

    if (courseId !== undefined) {
      if (courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        finalCourseId = course ? course.id : null;
        if (course && !subjectName) {
          resolvedSubjectName = course.title;
        }
      } else {
        finalCourseId = null;
      }
    }

    let parsedDueDate: Date | null = existing.dueDate;
    if (dueDate !== undefined) {
      if (dueDate) {
        const d = new Date(dueDate);
        parsedDueDate = !isNaN(d.getTime()) ? d : null;
      } else {
        parsedDueDate = null;
      }
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        instructions: instructions !== undefined ? instructions?.trim() : existing.instructions,
        courseId: finalCourseId,
        subjectName: resolvedSubjectName,
        topicName: topicName !== undefined ? topicName?.trim() : existing.topicName,
        dueDate: parsedDueDate,
        maxMarks: maxMarks !== undefined ? Number(maxMarks) : existing.maxMarks,
        status: status ? (status.toUpperCase() as any) : existing.status,
        attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : existing.attachmentUrl,
        attachmentName: attachmentName !== undefined ? attachmentName : existing.attachmentName,
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Delete Assignment
 * DELETE /api/assignments/:id
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing || existing.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    await prisma.assignment.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Submit an Assignment
 * POST /api/assignments/:id/submit
 * Restricted to: STUDENT
 */
export const submitAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    const { textContent, fileAttachmentUrl, fileAttachmentName } = req.body;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment || assignment.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    const student = await getOrCreateStudentProfile(user.userId);

    const submission = await (prisma.assignmentSubmission as any).upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: student.id,
        },
      },
      create: {
        assignmentId: id,
        studentId: student.id,
        textContent: textContent || null,
        fileAttachmentUrl: fileAttachmentUrl || null,
        fileAttachmentName: fileAttachmentName || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      update: {
        textContent: textContent || null,
        fileAttachmentUrl: fileAttachmentUrl || null,
        fileAttachmentName: fileAttachmentName || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 7. Grade an Assignment Submission
 * PATCH /api/assignments/submissions/:submissionId/grade
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const submissionId = req.params.submissionId as string;
    const { marksObtained, teacherFeedback, status = 'MARKED' } = req.body;

    const submission = await (prisma.assignmentSubmission as any).findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission || submission.assignment?.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Submission not found' });
      return;
    }

    const numericMarks = marksObtained !== undefined ? parseFloat(marksObtained) : null;

    if (numericMarks !== null && (numericMarks < 0 || numericMarks > submission.assignment.maxMarks)) {
      res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${submission.assignment.maxMarks}`,
      });
      return;
    }

    const updated = await (prisma.assignmentSubmission as any).update({
      where: { id: submissionId },
      data: {
        marksObtained: numericMarks,
        teacherFeedback: teacherFeedback !== undefined ? teacherFeedback : submission.teacherFeedback,
        status: status === 'RESULT_RELEASED' ? 'RESULT_RELEASED' : 'MARKED',
        markedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true, email: true },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 8. Get All Submissions for a specific Assignment
 * GET /api/assignments/:id/submissions
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const getAssignmentSubmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment || assignment.tenantId !== user.tenantId) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    const submissions = await (prisma.assignmentSubmission as any).findMany({
      where: { assignmentId: id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formatted = submissions.map((s: any) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: assignment.title,
      studentId: s.studentId,
      studentName: s.student?.user ? `${s.student.user.firstName} ${s.student.user.lastName}` : 'Student',
      studentEmail: s.student?.user?.email,
      studentAvatar: s.student?.user?.avatarUrl || undefined,
      submittedAt: s.submittedAt ? new Date(s.submittedAt).toISOString() : new Date().toISOString(),
      status: s.status?.toLowerCase() || 'submitted',
      textContent: s.textContent || undefined,
      fileAttachmentName: s.fileAttachmentName || undefined,
      fileAttachmentUrl: s.fileAttachmentUrl || undefined,
      marksObtained: s.marksObtained !== null && s.marksObtained !== undefined ? s.marksObtained : undefined,
      maxMarks: assignment.maxMarks,
      teacherFeedback: s.teacherFeedback || undefined,
      markedAt: s.markedAt ? new Date(s.markedAt).toISOString() : undefined,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
