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
 * Helper to format Prisma Assignment record into LMS Quiz shape
 */
const formatQuiz = (a: any, studentProfileId?: string) => {
  let parsedMeta: any = {};
  try {
    if (a.attachmentUrl) {
      parsedMeta = JSON.parse(a.attachmentUrl);
    }
  } catch (e) {
    parsedMeta = {};
  }

  const questions = Array.isArray(parsedMeta.questions) ? parsedMeta.questions : [];
  const durationMinutes = Number(parsedMeta.durationMinutes) || 15;

  const attempts = (a.submissions || []).map((sub: any) => {
    let subData: any = {};
    try {
      if (sub.textContent) {
        subData = JSON.parse(sub.textContent);
      }
    } catch (e) {
      subData = {};
    }

    const marksObtained =
      sub.marksObtained !== null && sub.marksObtained !== undefined
        ? Number(sub.marksObtained)
        : 0;
    const maxMarks = Number(a.maxMarks) || 100;
    const percentage = maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 100) : 0;

    let grade: 'A' | 'B' | 'C' | 'S' | 'F' = 'F';
    if (percentage >= 75) grade = 'A';
    else if (percentage >= 65) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 35) grade = 'S';

    const studentName = sub.student?.user
      ? `${sub.student.user.firstName} ${sub.student.user.lastName || ''}`.trim()
      : 'Student';

    return {
      id: sub.id,
      quizId: a.id,
      studentId: sub.studentId,
      studentName,
      studentAvatar: sub.student?.user?.avatarUrl || undefined,
      indexNo: sub.student?.studentIdNo || 'STU-001',
      classBatch: a.course?.title || a.subjectName || 'A/L Combined Mathematics',
      score: marksObtained,
      totalMarks: maxMarks,
      percentage,
      grade,
      timeSpentSeconds: Number(subData.timeSpentSeconds) || 0,
      submittedAt: sub.submittedAt
        ? new Date(sub.submittedAt).toISOString().replace('T', ' ').substring(0, 16)
        : new Date().toISOString().replace('T', ' ').substring(0, 16),
      answers: subData.answers || {},
    };
  });

  let userAttempt: any = { status: 'available' };
  if (studentProfileId) {
    const mySub = (a.submissions || []).find((s: any) => s.studentId === studentProfileId);
    if (mySub) {
      userAttempt = {
        status: mySub.status === 'RESULT_RELEASED' ? 'result_released' : 'submitted',
        score:
          mySub.marksObtained !== null && mySub.marksObtained !== undefined
            ? Number(mySub.marksObtained)
            : undefined,
        completedAt: mySub.submittedAt
          ? new Date(mySub.submittedAt).toISOString().replace('T', ' ').substring(0, 16)
          : undefined,
      };
    }
  }

  return {
    id: a.id,
    courseId: a.courseId || '',
    subjectName: a.subjectName || 'Combined Mathematics',
    title: a.title,
    instructions: a.instructions || 'Answer all questions within the allocated time limit.',
    durationMinutes,
    dueDate: a.dueDate
      ? new Date(a.dueDate).toISOString().replace('T', ' ').substring(0, 16)
      : '2026-11-15 23:59',
    status: (a.status === 'DRAFT' ? 'draft' : 'published') as 'draft' | 'published',
    totalQuestions: questions.length,
    totalMarks: Number(a.maxMarks) || questions.length * 10,
    questions,
    userAttempt,
    attempts,
  };
};

/**
 * 1. Get All Quizzes
 * GET /api/quizzes
 */
export const getQuizzes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { courseId, search } = req.query;

    const whereClause: any = {
      topicName: 'ONLINE_QUIZ',
    };

    if (user?.tenantId) {
      whereClause.tenantId = user.tenantId;
    }

    if (courseId && typeof courseId === 'string') {
      whereClause.courseId = courseId;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subjectName: { contains: search, mode: 'insensitive' } },
      ];
    }

    let studentProfileId: string | undefined;
    if (user && user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.userId },
      });
      studentProfileId = student?.id;
    }

    const quizzes = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = quizzes.map((q) => formatQuiz(q, studentProfileId));
    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Get Single Quiz By ID
 * GET /api/quizzes/:id
 */
export const getQuizById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = req.user;

    let studentProfileId: string | undefined;
    if (user && user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.userId },
      });
      studentProfileId = student?.id;
    }

    const quiz = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!quiz || quiz.topicName !== 'ONLINE_QUIZ') {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    res.status(200).json({ success: true, data: formatQuiz(quiz, studentProfileId) });
  } catch (error: any) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Create a New Quiz
 * POST /api/quizzes
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      durationMinutes = 15,
      dueDate,
      status = 'published',
      totalMarks,
      questions = [],
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Quiz title is required' });
      return;
    }

    let tenantId = user.tenantId;
    if (!tenantId) {
      const firstTenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
      tenantId = firstTenant?.id || null;
    }

    if (!tenantId) {
      res.status(403).json({ success: false, message: 'A tenant is required to create quizzes.' });
      return;
    }

    const teacher = await getOrCreateTeacherProfile(user.userId);

    let finalCourseId: string | null = null;
    let resolvedSubject = subjectName;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        finalCourseId = course.id;
        if (!resolvedSubject) resolvedSubject = course.title;
      }
    }

    const calculatedMarks =
      Number(totalMarks) ||
      (Array.isArray(questions)
        ? questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 10), 0)
        : 100);

    const metadataJson = JSON.stringify({
      durationMinutes: Number(durationMinutes) || 15,
      questions: Array.isArray(questions) ? questions : [],
    });

    let parsedDueDate: Date | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) parsedDueDate = d;
    }

    const quiz = await prisma.assignment.create({
      data: {
        tenantId,
        teacherId: teacher.id,
        courseId: finalCourseId,
        subjectName: resolvedSubject || 'Combined Mathematics',
        title: title.trim(),
        instructions:
          instructions?.trim() || 'Answer all questions within the allocated time limit.',
        topicName: 'ONLINE_QUIZ',
        dueDate: parsedDueDate,
        maxMarks: calculatedMarks,
        status: status === 'draft' ? 'DRAFT' : 'PUBLISHED',
        attachmentName: 'QUIZ_CONFIG',
        attachmentUrl: metadataJson,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: formatQuiz(quiz),
    });
  } catch (error: any) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Update an Existing Quiz
 * PUT /api/quizzes/:id
 */
export const updateQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      title,
      instructions,
      courseId,
      subjectName,
      durationMinutes,
      dueDate,
      status,
      totalMarks,
      questions,
    } = req.body;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing || existing.topicName !== 'ONLINE_QUIZ') {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    let existingMeta: any = {};
    try {
      if (existing.attachmentUrl) existingMeta = JSON.parse(existing.attachmentUrl);
    } catch (e) {
      existingMeta = {};
    }

    const updatedQuestions = questions !== undefined ? questions : existingMeta.questions || [];
    const updatedDuration =
      durationMinutes !== undefined ? Number(durationMinutes) : existingMeta.durationMinutes || 15;

    const metadataJson = JSON.stringify({
      durationMinutes: updatedDuration,
      questions: updatedQuestions,
    });

    const updateData: any = {
      attachmentUrl: metadataJson,
    };

    if (title !== undefined) updateData.title = title.trim();
    if (instructions !== undefined) updateData.instructions = instructions.trim();
    if (courseId !== undefined) updateData.courseId = courseId;
    if (subjectName !== undefined) updateData.subjectName = subjectName;
    if (status !== undefined) updateData.status = status === 'draft' ? 'DRAFT' : 'PUBLISHED';
    if (totalMarks !== undefined) {
      updateData.maxMarks = Number(totalMarks);
    } else if (questions !== undefined) {
      updateData.maxMarks = updatedQuestions.reduce(
        (sum: number, q: any) => sum + (Number(q.marks) || 10),
        0
      );
    }

    if (dueDate !== undefined) {
      const d = new Date(dueDate);
      updateData.dueDate = !isNaN(d.getTime()) ? d : null;
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: formatQuiz(updated),
    });
  } catch (error: any) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Delete a Quiz
 * DELETE /api/quizzes/:id
 */
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.assignment.findUnique({ where: { id } });

    if (!existing || existing.topicName !== 'ONLINE_QUIZ') {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    await prisma.assignment.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Submit a Student Quiz Attempt & Auto-Grade
 * POST /api/quizzes/:id/attempt
 */
export const submitQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = String(req.params.id);
    const { answers = {}, timeSpentSeconds = 0 } = req.body;

    const quiz = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz || quiz.topicName !== 'ONLINE_QUIZ') {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    let parsedMeta: any = {};
    try {
      if (quiz.attachmentUrl) {
        parsedMeta = JSON.parse(quiz.attachmentUrl);
      }
    } catch (e) {
      parsedMeta = {};
    }

    const questions: any[] = Array.isArray(parsedMeta.questions) ? parsedMeta.questions : [];

    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
        const marks = Number(q.marks) || 10;
        if (q.type === 'short_answer' || q.type === 'numerical') {
          if (
            String(studentAns).trim().toLowerCase() ===
            String(q.correctAnswer).trim().toLowerCase()
          ) {
            score += marks;
          }
        } else if (q.type === 'multi_select') {
          const correctArr = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.map(String).sort()
            : [String(q.correctAnswer)];
          const studentArr = Array.isArray(studentAns)
            ? (studentAns as any[]).map(String).sort()
            : [String(studentAns)];
          if (
            studentArr.length === correctArr.length &&
            studentArr.every((v, i) => v === correctArr[i])
          ) {
            score += marks;
          }
        } else {
          if (String(studentAns) === String(q.correctAnswer)) {
            score += marks;
          }
        }
      }
    });

    const totalMarks = Number(quiz.maxMarks) || questions.length * 10;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    let grade: 'A' | 'B' | 'C' | 'S' | 'F' = 'F';
    if (percentage >= 75) grade = 'A';
    else if (percentage >= 65) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 35) grade = 'S';

    const student = await getOrCreateStudentProfile(user.userId);

    const submissionData = {
      marksObtained: score,
      status: 'RESULT_RELEASED' as const,
      textContent: JSON.stringify({ answers, timeSpentSeconds, percentage, grade }),
      submittedAt: new Date(),
    };

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: student.id,
        },
      },
      create: {
        assignmentId: id,
        studentId: student.id,
        ...submissionData,
      },
      update: {
        ...submissionData,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz attempt evaluated and saved successfully',
      data: {
        submissionId: submission.id,
        score,
        totalMarks,
        percentage,
        grade,
      },
    });
  } catch (error: any) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
