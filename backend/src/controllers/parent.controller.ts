import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';
import { hashOtpToken, OtpConfigurationError } from '../services/otp.service';
import { sendParentLinkVerificationEmail } from '../services/email.service';
import { fromBuffer } from 'file-type';

const safeEqualHex = (expectedHex: string, providedHex: string): boolean => {
  const expected = Buffer.from(expectedHex, 'hex');
  const provided = Buffer.from(providedHex, 'hex');
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
};

/**
 * Helper to ensure a ParentProfile exists for the authenticated user and has linked student(s).
 */
export const getOrCreateParentProfile = async (userId: string): Promise<any> => {
  let parent: any = await prisma.parentProfile.findUnique({
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
          tenant: { select: { id: true, name: true, status: true, deletedAt: true } },
        },
      },
      students: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          enrollments: {
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
          },
          packageSubscriptions: {
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
                },
              },
            },
          },
          liveAttendances: {
            orderBy: { joinedAt: 'desc' },
            take: 15,
          },
          assignmentSubmissions: {
            include: {
              assignment: true,
            },
            orderBy: { submittedAt: 'desc' },
            take: 15,
          },
        },
      },
    },
  });

  if (!parent) {
    await prisma.parentProfile.create({ data: { userId } });

    parent = await prisma.parentProfile.findUnique({
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
              tenant: { select: { id: true, name: true, status: true, deletedAt: true } },
          },
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            enrollments: {
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
            },
            packageSubscriptions: {
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
                  },
                },
              },
            },
            liveAttendances: {
              orderBy: { joinedAt: 'desc' },
              take: 15,
            },
            assignmentSubmissions: {
              include: {
                assignment: true,
              },
              orderBy: { submittedAt: 'desc' },
              take: 15,
            },
          },
        },
      },
    });
  }

  return parent;
};

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'student email';
  return `${local.slice(0, 1)}***@${domain}`;
};

export const linkChildStudent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId || req.user?.role !== 'PARENT') {
      res.status(403).json({ success: false, message: 'Parent account required.' });
      return;
    }
    const lookup = String(req.body?.studentIdentifier || req.body?.childStudentId || '').trim();
    if (!lookup) {
      res.status(400).json({ success: false, message: 'Enter the student ID, phone number, or account email.' });
      return;
    }

    const parent = await getOrCreateParentProfile(userId);
    const tenantId = parent?.user?.tenantId;
    if (!parent || !tenantId) {
      res.status(403).json({ success: false, message: 'Parent account must belong to an active organization.' });
      return;
    }

    const digits = lookup.replace(/\D/g, '');
    const student = await prisma.studentProfile.findFirst({
      where: {
        user: { tenantId, role: 'STUDENT', isActive: true },
        OR: [
          { studentIdNo: { equals: lookup, mode: 'insensitive' } },
          { user: { email: { equals: lookup, mode: 'insensitive' } } },
          { phoneNumber: lookup },
          ...(digits.length >= 9 ? [{ phoneNumber: { contains: digits.slice(-9) } }] : []),
        ],
      },
      include: { user: { select: { firstName: true, lastName: true, email: true, tenantId: true } } },
    });
    if (!student) {
      res.status(404).json({ success: false, message: 'No active student matched that identifier in your organization.' });
      return;
    }
    if (student.user.tenantId !== tenantId) {
      res.status(403).json({ success: false, message: 'Cross-organization student linking is not allowed.' });
      return;
    }
    if (student.guardianId === parent.id) {
      res.status(200).json({ success: true, alreadyLinked: true, message: 'This student is already linked to your account.' });
      return;
    }
    if (student.guardianId) {
      res.status(409).json({ success: false, message: 'This student is already linked to another guardian. Contact your organization administrator.' });
      return;
    }
    if (!student.user.email) {
      res.status(400).json({ success: false, message: 'The student account needs a verified email before a guardian can request access.' });
      return;
    }

    const now = new Date();
    await prisma.parentChildLinkRequest.updateMany({
      where: { parentId: parent.id, studentId: student.id, consumedAt: null },
      data: { consumedAt: now },
    });
    const otp = crypto.randomInt(100000, 1000000).toString();
    const requestId = crypto.randomUUID();
    const request = await prisma.parentChildLinkRequest.create({
      data: {
        id: requestId,
        parentId: parent.id,
        studentId: student.id,
        tokenHash: hashOtpToken(requestId, 'PARENT_CHILD_LINK', otp),
        expiresAt: new Date(now.getTime() + 15 * 60_000),
      },
    });
    const delivery = await sendParentLinkVerificationEmail({
      to: student.user.email,
      studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      otp,
    });
    if (!delivery.success) {
      await prisma.parentChildLinkRequest.delete({ where: { id: request.id } });
      res.status(503).json({ success: false, message: 'Could not send the student approval code. Try again later.' });
      return;
    }

    res.status(202).json({
      success: true,
      verificationRequired: true,
      requestId: request.id,
      maskedEmail: maskEmail(student.user.email),
      studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      message: 'A one-time approval code was sent to the student account email.',
    });
  } catch (error) {
    if (error instanceof OtpConfigurationError) {
      res.status(503).json({ success: false, message: 'Student approval codes are temporarily unavailable.' });
      return;
    }
    console.error('Error starting parent-child link:', error);
    res.status(500).json({ success: false, message: 'Could not start the student link request.' });
  }
};

export const getPendingChildLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId || req.user.role !== 'PARENT') {
      res.status(403).json({ success: false, message: 'Parent account required.' });
      return;
    }
    const parent = await getOrCreateParentProfile(req.user.userId);
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found.' });
      return;
    }
    const request = await prisma.parentChildLinkRequest.findFirst({
      where: { parentId: parent.id, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
      orderBy: { createdAt: 'desc' },
      include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
    });
    res.status(200).json({
      success: true,
      data: request ? {
        requestId: request.id,
        studentName: `${request.student.user.firstName} ${request.student.user.lastName}`.trim(),
        maskedEmail: maskEmail(request.student.user.email),
        expiresAt: request.expiresAt,
      } : null,
    });
  } catch (error) {
    console.error('Error loading pending parent-child link:', error);
    res.status(500).json({ success: false, message: 'Could not load the pending student link.' });
  }
};

export const getParentPackages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const childId = String(req.query.childId || '');
    if (!userId || req.user?.role !== 'PARENT' || !childId) {
      res.status(400).json({ success: false, message: 'A linked child is required.' });
      return;
    }
    const parent = await prisma.parentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) {
      res.status(403).json({ success: false, message: 'Parent profile is required.' });
      return;
    }
    const child = await prisma.studentProfile.findFirst({
      where: { id: childId, guardianId: parent.id, user: { role: 'STUDENT', isActive: true } },
      select: { user: { select: { tenantId: true } } },
    });
    const tenantId = child?.user.tenantId;
    if (!tenantId) {
      res.status(404).json({ success: false, message: 'Child is not linked to this parent or has no active tenant.' });
      return;
    }
    const packages = await prisma.package.findMany({
      where: {
        tenantId,
        isPublished: true,
        teacher: { user: { tenantId, isActive: true } },
      },
      select: {
        id: true,
        title: true,
        price: true,
        billingCycle: true,
        durationDays: true,
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    console.error('Error loading parent packages:', error);
    res.status(500).json({ success: false, message: 'Could not load packages for the linked child.' });
  }
};

export const confirmChildLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId || req.user.role !== 'PARENT') {
      res.status(403).json({ success: false, message: 'Parent account required.' });
      return;
    }
    const requestId = String(req.body?.requestId || '').trim();
    const otp = String(req.body?.otp || '').trim();
    if (!requestId || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, message: 'A request ID and six-digit approval code are required.' });
      return;
    }
    const parent = await getOrCreateParentProfile(req.user.userId);
    const request = await prisma.parentChildLinkRequest.findFirst({
      where: { id: requestId, parentId: parent.id, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
      include: { student: { include: { user: { select: { tenantId: true, isActive: true, role: true } } } }, parent: { include: { user: { select: { tenantId: true } } } } },
    });
    if (!request) {
      res.status(400).json({ success: false, message: 'Approval request is invalid, expired, or already used.' });
      return;
    }
    if (!safeEqualHex(request.tokenHash, hashOtpToken(request.id, 'PARENT_CHILD_LINK', otp))) {
      await prisma.parentChildLinkRequest.updateMany({
        where: { id: request.id, attempts: { lt: 5 }, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { attempts: { increment: 1 } },
      });
      res.status(400).json({ success: false, message: 'Approval code is invalid.' });
      return;
    }
    if (
      request.parent.user.tenantId !== request.student.user.tenantId ||
      request.student.user.role !== 'STUDENT' ||
      !request.student.user.isActive
    ) {
      res.status(403).json({ success: false, message: 'Student and guardian must be active in the same organization.' });
      return;
    }

    const linked = await prisma.$transaction(async (tx) => {
      const claimed = await tx.parentChildLinkRequest.updateMany({
        where: { id: request.id, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
        data: { consumedAt: new Date() },
      });
      if (claimed.count !== 1) return false;
      if (request.student.guardianId === parent.id) return true;
      if (request.student.guardianId) return false;
      const update = await tx.studentProfile.updateMany({
        where: { id: request.studentId, guardianId: null },
        data: { guardianId: parent.id },
      });
      return update.count === 1;
    });
    if (!linked) {
      res.status(409).json({ success: false, message: 'The student has already been linked to a guardian.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Student approved and linked to your Parent Portal.' });
  } catch (error) {
    if (error instanceof OtpConfigurationError) {
      res.status(503).json({ success: false, message: 'Student approval codes are temporarily unavailable.' });
      return;
    }
    console.error('Error confirming parent-child link:', error);
    res.status(500).json({ success: false, message: 'Could not confirm the student link.' });
  }
};

/**
 * 1. Get Parent's Children List with live academic profiles
 * GET /api/parents/children
 */
export const getMyChildren = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parent = await getOrCreateParentProfile(userId);
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    // Format students into full ParentChildProfile shape
    const formattedChildren = (parent.students || []).map((student: any) => {
      const studentName = `${student.user?.firstName || 'Student'} ${student.user?.lastName || ''}`.trim();
      const initials = studentName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'ST';

      // 1. Build Enrolments
      const enrolments = (student.enrollments || []).map((enr: any, idx: number) => {
        const teacherUser = enr.course?.teacher?.user;
        const teacherName = teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}`.trim() : 'Faculty Educator';
        const subject = enr.course?.title || 'Course';

        // Check if there is an active package subscription for this course/teacher
        const sub = (student.packageSubscriptions || []).find(
          (s: any) => s.package?.teacherId === enr.course?.teacherId
        );

        const feeStatus = sub?.status === 'ACTIVE' ? 'paid' : sub?.status === 'PENDING' ? 'pending_slip' : 'overdue';

        return {
          id: enr.id || `enr_${idx}`,
          teacherId: enr.course?.teacherId || `tch_${idx}`,
          teacherName,
          teacherTitle: 'Senior Master Tutor & Paper Author',
          subject,
          avatarColor: idx % 2 === 0 ? 'bg-emerald-600' : 'bg-teal-600',
          initials: teacherName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'SP',
          packageName: sub?.package?.title || '',
          batch: student.section || '',
          monthlyFeeLkr: Number(sub?.package?.price || 0),
          feeStatus,
          validUntil: sub?.endDate ? sub.endDate.toISOString().split('T')[0] : '',
          lastPaymentDate: sub?.updatedAt ? sub.updatedAt.toISOString().split('T')[0] : '',
          lastPaymentRef: sub?.bankRefNo || '',
          paymentBank: '',
          liveClassSchedule: '',
          platform: 'Google Meet' as const,
          meetingUrl: '',
          nextSessionDate: '',
          nextSessionTopic: '',
          attendanceRate: 0,
          attendedSessions: 0,
          totalSessions: 0,
          latestPaperMark: 0,
          latestPaperMax: 0,
          batchRank: 0,
          batchTotalStudents: 0,
          tutorPhone: '',
        };
      });

      // 2. Build Invoices from PackageSubscriptions
      const invoices = (student.packageSubscriptions || []).map((sub: any, idx: number) => {
        const teacherUser = sub.package?.teacher?.user;
        const teacherName = teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Faculty Educator';
        const status = sub.status === 'ACTIVE' ? 'cleared' : sub.status === 'PENDING' ? 'under_review' : 'overdue';

        return {
          id: sub.id,
          invoiceNumber: sub.receiptNo || '',
          childId: student.id,
          childName: studentName,
          teacherName,
          subject: sub.package?.title || 'Tuition package',
          month: sub.createdAt ? sub.createdAt.toLocaleString('en', { month: 'long', year: 'numeric' }) : '',
          amountLkr: Number(sub.paidAmount ?? sub.package?.price ?? 0),
          status: status as 'cleared' | 'under_review' | 'overdue',
          paymentMethod: sub.paymentMethod === 'BANK_SLIP' ? 'bank_slip' : 'online_card' as const,
          slipRefNumber: sub.bankRefNo || undefined,
          bankName: '',
          branchName: '',
          depositedDate: sub.createdAt ? sub.createdAt.toISOString().split('T')[0] : '',
          slipImageUrl: sub.slipUrl || undefined,
          tutorNotes: sub.paymentNotes || '',
        };
      });

      // 3. Build Paper Marks from AssignmentSubmissions
      const paperMarks = (student.assignmentSubmissions || []).map((sub: any, idx: number) => {
        const maxScore = Number(sub.assignment?.maxMarks ?? 0);
        const score = Number(sub.marksObtained ?? 0);
        const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const grade = pct >= 75 ? 'A' : pct >= 65 ? 'B' : pct >= 55 ? 'C' : pct >= 35 ? 'S' : 'F';

        return {
          id: sub.id,
          childId: student.id,
          paperCode: sub.id.slice(0, 12).toUpperCase(),
          title: sub.assignment?.title || 'Assignment submission',
          tutorName: 'Faculty Educator',
          subject: sub.assignment?.subjectName || '',
          date: sub.submittedAt ? sub.submittedAt.toISOString().split('T')[0] : '',
          score,
          maxScore,
          batchAverage: 0,
          highestScore: 0,
          rank: 0,
          batchTotal: 0,
          grade: maxScore > 0 ? grade : 'N/A',
          tutorFeedback: sub.teacherFeedback || '',
        };
      });

      // 4. Build Attendance Logs
      const attendanceLogs = (student.liveAttendances || []).map((att: any) => ({
        id: att.id,
        childId: student.id,
        sessionTitle: 'Weekly Masterclass Lecture',
        tutorName: 'Faculty Educator',
        subject: 'Combined Mathematics',
        date: att.joinedAt ? att.joinedAt.toISOString().split('T')[0] : '',
        timeSlot: '',
        platform: 'Google Meet' as const,
        status: 'attended' as const,
        durationMinutes: Math.round((att.durationSeconds || 0) / 60),
        totalDurationMinutes: 0,
        joinTime: '',
        leaveTime: '',
        recordingWatched: false,
      }));

      // Calculate aggregate stats
      const totalPaperMarks = paperMarks.length;
      const avgScore =
        totalPaperMarks > 0
          ? Math.round(paperMarks.reduce((acc: number, p: any) => acc + (p.maxScore > 0 ? p.score / p.maxScore : 0), 0) / totalPaperMarks * 100)
          : 0;

      return {
        id: student.id,
        studentId: student.id,
        name: studentName,
        admissionNo: student.studentIdNo,
        grade: student.gradeLevel || '',
        classSection: student.section || '',
        avatarText: initials,
        schoolName: parent.user?.tenant?.name || 'LimaT Learning Portal',
        enrolledSinceYear: student.createdAt ? String(student.createdAt.getFullYear()) : '',
        admissionGrade: student.gradeLevel || '',
        currentStage: student.gradeLevel || '',
        cumulativeCareerAverage: avgScore,
        totalYearsEnrolled: student.createdAt ? Math.max(0, new Date().getFullYear() - student.createdAt.getFullYear()) : 0,
        classTeacher: '',
        classTeacherEmail: '',
        classTeacherPhone: '',
        attendanceRate: 0,
        presentDays: attendanceLogs.length,
        totalDays: attendanceLogs.length,
        overallAverage: avgScore,
        classRank: 0,
        totalStudents: 0,
        upcomingExamsCount: 0,
        hallTicketNo: '',
        nextExamDate: '',
        nextExamName: '',
        monthlyInvestmentLkr: invoices.filter((invoice: any) => invoice.status === 'cleared').reduce((sum: number, invoice: any) => sum + invoice.amountLkr, 0),
        activeEnrolmentsCount: enrolments.length,
        pendingSlipsCount: invoices.filter((invoice: any) => invoice.status === 'under_review').length,
        announcements: [],
        enrolments,
        invoices,
        paperMarks,
        attendanceLogs,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedChildren,
    });
  } catch (error: any) {
    console.error('Error in getMyChildren:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Get Parent Dashboard Overview Metrics
 * GET /api/parents/dashboard?childId=xyz
 */
export const getParentDashboardOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parent = await getOrCreateParentProfile(userId);
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    const childIdParam = req.query.childId as string | undefined;
    const targetStudent = childIdParam
      ? (parent.students || []).find((s: any) => s.id === childIdParam)
      : parent.students?.[0];
    if (childIdParam && !targetStudent) {
      res.status(404).json({ success: false, message: 'Child is not linked to this parent' });
      return;
    }

    const tenantId = req.user?.tenantId;

    // Upcoming live sessions
    const upcomingLive = await prisma.liveClassSession.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: { in: ['SCHEDULED', 'LIVE'] },
        startTime: { gte: new Date(Date.now() - 3600000) },
      },
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 4,
    });

    // Parent announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        targetAudience: { in: ['ALL', 'PARENTS', 'STUDENTS', 'Everyone'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        parent: {
          id: parent.id,
          name: `${parent.user?.firstName || 'Parent'} ${parent.user?.lastName || ''}`.trim(),
          email: parent.user?.email,
          phoneNumber: parent.phoneNumber,
        },
        selectedChildId: targetStudent?.id,
        totalChildren: (parent.students || []).length,
        upcomingLiveSessions: upcomingLive,
        announcements,
      },
    });
  } catch (error: any) {
    console.error('Error in getParentDashboardOverview:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Submit Parent Leave Request for Child
 * POST /api/parents/leave-request
 */
export const submitLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { childId, startDate, endDate, reason, note, tutorName } = req.body;

    if (!childId || !note) {
      res.status(400).json({ success: false, message: 'childId and note are required' });
      return;
    }

    const leaveRecord = {
      id: `leave_${Date.now()}`,
      childId,
      tutorName: tutorName || 'Faculty Educator',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || startDate || new Date().toISOString().split('T')[0],
      reason: reason || 'School Exam Clashing',
      note: String(note).trim(),
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    };

    res.status(200).json({
      success: true,
      message: 'Leave application submitted successfully to tutor',
      data: leaveRecord,
    });
  } catch (error: any) {
    console.error('Error in submitLeaveRequest:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Submit Bank Deposit Slip for Tuition Package
 * POST /api/parents/deposit-slip
 */
export const submitDepositSlip = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      childId,
      packageId,
      slipRefNumber,
      bankName,
      branchName,
      depositedDate,
      amountLkr,
      slipImageUrl,
      tutorName,
    } = req.body;

    if (!childId || !packageId || !slipRefNumber || !slipImageUrl) {
      res.status(400).json({ success: false, message: 'childId, packageId, slipRefNumber, and an uploaded slip are required' });
      return;
    }
    const normalizedReference = String(slipRefNumber).trim().toUpperCase();
    if (normalizedReference.length < 3 || normalizedReference.length > 60) {
      res.status(400).json({ success: false, message: 'Bank reference must be between 3 and 60 characters.' });
      return;
    }
    const slipMatch = /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(slipImageUrl));
    if (!slipMatch) {
      res.status(400).json({ success: false, message: 'Upload a JPG, PNG, WebP, or PDF bank slip.' });
      return;
    }
    const slipBytes = Buffer.from(slipMatch[2], 'base64');
    if (!slipBytes.length || slipBytes.length > 1_000_000) {
      res.status(400).json({ success: false, message: 'Bank slip file must be smaller than 1 MB.' });
      return;
    }
    const detectedSlip = await fromBuffer(slipBytes);
    if (!detectedSlip || detectedSlip.mime !== slipMatch[1]) {
      res.status(400).json({ success: false, message: 'Uploaded file contents do not match an allowed bank slip format.' });
      return;
    }
    const amount = Number(amountLkr);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ success: false, message: 'A valid positive payment amount is required.' });
      return;
    }
    const depositDay = String(depositedDate || '');
    const parsedDepositDay = new Date(`${depositDay}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(depositDay) || Number.isNaN(parsedDepositDay.getTime()) || parsedDepositDay.getTime() > Date.now() + 86_400_000) {
      res.status(400).json({ success: false, message: 'Enter a valid deposit date.' });
      return;
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId },
      include: { user: { select: { tenantId: true } } },
    });
    if (!parent) {
      res.status(403).json({ success: false, message: 'Parent profile is required' });
      return;
    }

    // Find student
    const student = await prisma.studentProfile.findFirst({
      where: { id: childId, guardianId: parent.id },
      include: { user: true },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const tenantId = student.user.tenantId;
    if (!tenantId || tenantId !== parent.user.tenantId) {
      res.status(403).json({ success: false, message: 'Student account is not assigned to a tenant' });
      return;
    }

    const pkg = await prisma.package.findFirst({
      where: { id: packageId, tenantId, isPublished: true },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Published package not found for this child organization.' });
      return;
    }

    if (Math.abs(Number(pkg.price) - amount) > 0.01) {
      res.status(400).json({ success: false, message: 'Submitted amount does not match the selected package price.' });
      return;
    }

    const pendingSubscription = await prisma.packageSubscription.findFirst({
      where: { studentId: student.id, packageId: pkg.id, status: 'PENDING' },
      select: { id: true },
    });
    if (pendingSubscription) {
      res.status(409).json({ success: false, message: 'A bank slip for this package is already awaiting review.' });
      return;
    }

    const durationDays = pkg.durationDays || 30;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const receiptNo = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    // Check if subscription already exists
    const subscription = await prisma.packageSubscription.create({
      data: {
        studentId: student.id,
        packageId: pkg.id,
        status: 'PENDING',
        startDate,
        endDate,
        paidAmount: amount,
        paymentMethod: 'BANK_SLIP',
        receiptNo,
        bankRefNo: normalizedReference,
        slipUrl: slipImageUrl,
        slipFileName: `deposit-slip.${detectedSlip.ext}`,
        paymentNotes: `Bank deposit slip submitted by parent. Bank: ${String(bankName || '').trim().slice(0, 100)}, Branch: ${String(branchName || '').trim().slice(0, 100)}.`,
      },
    });

    const invoiceData = {
      id: subscription.id,
      invoiceNumber: receiptNo,
      childId: student.id,
      childName: `${student.user.firstName} ${student.user.lastName}`,
      teacherName: tutorName || 'Faculty Educator',
      subject: pkg.title,
      month: subscription.createdAt.toLocaleString('en', { month: 'long', year: 'numeric' }),
      amountLkr: amount,
      status: 'under_review' as const,
      paymentMethod: 'bank_slip' as const,
      slipRefNumber: normalizedReference,
      bankName: String(bankName || '').trim().slice(0, 100),
      branchName: String(branchName || '').trim().slice(0, 100),
      depositedDate: depositDay,
      slipImageUrl,
      tutorNotes: 'Deposit slip submitted via Parent Portal. Awaiting tutor assistant clearance.',
    };

    res.status(200).json({
      success: true,
      message: 'Bank deposit slip submitted and is pending verification. No access was granted.',
      data: {
        subscription,
        invoice: invoiceData,
      },
    });
  } catch (error: any) {
    console.error('Error in submitDepositSlip:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Get Current Parent Profile
 * GET /api/parents/me
 */
export const getMyParentProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parent = await getOrCreateParentProfile(userId);
    res.status(200).json({
      success: true,
      data: {
        id: parent.id,
        userId: parent.userId,
        phoneNumber: parent.phoneNumber,
        user: parent.user,
        studentsCount: parent.students?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in getMyParentProfile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Update Current Parent Profile
 * PUT /api/parents/me
 */
export const updateMyParentProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { firstName, lastName, avatarUrl, phoneNumber } = req.body;

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

    const updatedProfile = await prisma.parentProfile.upsert({
      where: { userId },
      create: {
        userId,
        phoneNumber: phoneNumber || null,
      },
      update: {
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
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
      message: 'Parent profile updated successfully',
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in updateMyParentProfile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
