import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { generateSetupToken, hashSetupToken } from '../utils/setupToken';
import { config } from '../config';

/**
 * Helper to resolve the active tenant ID from request user, header, or default
 */

export class TenantResolutionError extends Error {
  constructor(
    public readonly status: 400 | 403 | 404,
    message: string
  ) {
    super(message);
  }
}

const sendTenantResolutionError = (
  res: Response,
  error: unknown
): boolean => {
  if (!(error instanceof TenantResolutionError)) {
    return false;
  }

  let message =
    error.status === 404
      ? 'Organization not found.'
      : error.status === 400
        ? 'Tenant selection is required.'
        : 'Access denied.';

  if (error.message === 'Class not found') message = 'Class not found.';
  if (error.message === 'Subject not found') message = 'Subject not found.';

  res.status(error.status).json({ success: false, message });
  return true;
};

export const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string> => {
  const user = req.user;

  if (!user) {
    throw new TenantResolutionError(403, 'Authentication required');
  }

  let tenantId: string;

  if (user.role === 'SUPER_ADMIN') {
    const rawHeader = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(rawHeader)
      ? rawHeader[0]
      : rawHeader;

    if (!headerTenantId) {
      throw new TenantResolutionError(400, 'Super Admin tenant selection required');
    }

    tenantId = headerTenantId;
  } else {
    if (user.role !== 'ADMIN') {
      throw new TenantResolutionError(403, 'Admin access required');
    }

    if (!user.tenantId) {
      throw new TenantResolutionError(403, 'User is not assigned to a tenant');
    }

    const rawHeader = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(rawHeader)
      ? rawHeader[0]
      : rawHeader;

    if (headerTenantId && headerTenantId !== user.tenantId) {
      throw new TenantResolutionError(403, 'Cross-tenant access denied');
    }

    tenantId = user.tenantId;
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      deletedAt: null,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (!tenant) {
    throw new TenantResolutionError(404, 'Tenant not found or inactive');
  }

  return tenant.id;
};

export const getAdminOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    if (!tenantId) {
      res.status(404).json({ success: false, message: 'No active school tenant found.' });
      return;
    }

    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalAssignments,
      totalAnnouncements,
      tenantRecord,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT' } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER' } }),
      prisma.user.count({ where: { tenantId, role: 'ADMIN' } }),
      prisma.course.count({ where: { tenantId } }),
      prisma.assignment.count({ where: { course: { tenantId } } }),
      prisma.announcement.count({ where: { tenantId } }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, domain: true, status: true, plan: true, settings: true },
      }),
    ]);

    // Parse classes and subjects from tenant settings
    const settings = (tenantRecord?.settings as Record<string, any>) || {};
    const classes = Array.isArray(settings.classes) ? settings.classes : [];
    const subjects = Array.isArray(settings.subjects) ? settings.subjects : [];

    // Fetch recent 5 students and recent 5 staff members
    const [recentStudents, recentStaff] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId, role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          isActive: true,
          studentProfile: {
            select: { studentIdNo: true, gradeLevel: true, section: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { tenantId, role: { in: ['TEACHER', 'ADMIN'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          isActive: true,
          teacherProfile: {
            select: { employeeNo: true, specialization: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: tenantRecord?.id,
          name: tenantRecord?.name,
          domain: tenantRecord?.domain,
          status: tenantRecord?.status,
          plan: tenantRecord?.plan,
        },
        kpis: {
          totalStudents,
          totalTeachers,
          totalStaff: totalTeachers + totalAdmins,
          totalCourses,
          totalClasses: classes.length,
          totalSubjects: subjects.length,
          totalAssignments,
          totalAnnouncements,
          activeAttendanceRate: '94.8%',
          systemHealth: '100% Operational',
        },
        recentStudents,
        recentStaff,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to load school admin overview' });
  }
};

/**
 * 2. GET /api/admin/staff
 * Get all staff members (Teachers, Coaches, Admins)
 */
export const getStaff = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);

    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['TEACHER', 'ADMIN'] },
      },
      include: {
        teacherProfile: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const staffList = users.map((user) => {
      const isTeacher = user.role === 'TEACHER';
      const tp = user.teacherProfile;
      return {
        id: user.id,
        schoolId: tenantId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: isTeacher ? 'teacher' : 'administrator',
        staffId: tp?.employeeNo || `STAFF-${user.id.substring(0, 6).toUpperCase()}`,
        photo: user.avatarUrl || undefined,
        phone: tp?.phone || undefined,
        status: user.isActive ? 'active' : 'inactive',
        qualification: (Array.isArray(tp?.qualifications) && tp?.qualifications.length > 0)
          ? (tp.qualifications[0] as any)?.degree || 'B.Sc. Graduate'
          : tp?.specialization || 'Academic Staff',
        subjects: tp?.specialization ? [tp.specialization] : ['General Studies'],
        classes: ['Grade 12-A', 'Grade 13-A'],
        medium: (tp?.mediums && tp.mediums[0]) ? (tp.mediums[0].toLowerCase() as any) : 'english',
        sports: [],
        teams: [],
        workload: 16,
      };
    });

    res.status(200).json({
      success: true,
      data: staffList,
    });
  } catch (error: any) {
    console.error('Error fetching school staff:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to fetch staff members' });
  }
};

/**
 * 3. POST /api/admin/staff
 * Create a new staff member (Teacher or Admin)
 */
export const createStaff = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const {
      name,
      email,
      role = 'teacher',
      staffId,
      phone,
      qualification,
      subjects = [],
      classes = [],
      medium = 'english',
      status = 'active',
    } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    if (!['teacher', 'administrator'].includes(role)) {
  res.status(400).json({
    success: false,
    message: 'Invalid staff role.',
  });
  return;
}

if (!['active', 'inactive'].includes(status)) {
  res.status(400).json({
    success: false,
    message: 'Invalid staff status.',
  });
  return;
}

    const cleanEmail = String(email).trim().toLowerCase();

const existingUser = await prisma.user.findUnique({
  where: { email: cleanEmail },
});
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Staff';
    const lastName = nameParts.slice(1).join(' ') || 'Member';
    const systemRole = role === 'administrator' ? 'ADMIN' : 'TEACHER';
    const employeeNo = staffId || `EMP-${Date.now().toString().slice(-6)}`;
    const specialization = Array.isArray(subjects) && subjects.length > 0 ? subjects.join(', ') : 'Educator';

    const setupToken = generateSetupToken();
    const setupTokenHash = hashSetupToken(setupToken);
    const passwordHash = await bcrypt.hash(setupToken, 12);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    let newUser: any;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      newUser = await tx.user.create({
        data: {
          tenantId,
          email: cleanEmail,
          passwordHash,
          mustChangePassword: true,
          firstName,
          lastName,
          role: systemRole,
          isActive: status === 'active',
        },
      });

      if (systemRole === 'TEACHER') {
        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
            employeeNo,
            specialization,
            phone: phone || '',
            mediums: [medium.charAt(0).toUpperCase() + medium.slice(1)],
            qualifications: qualification ? [{ degree: qualification, institution: 'Certified Institution' }] : [],
            isVerified: true,
          },
        });
      }

      await tx.setupToken.create({
        data: {
          userId: newUser.id,
          tenantId,
          tokenHash: setupTokenHash,
          expiresAt,
          createdAt: new Date(),
        },
      });
    });

    const createdStaff = {
      id: newUser.id,
      schoolId: tenantId,
      name,
      email,
      role,
      staffId: employeeNo,
      phone,
      status,
      qualification: qualification || specialization,
      subjects: Array.isArray(subjects) ? subjects : [specialization],
      classes: Array.isArray(classes) ? classes : [],
      medium,
      sports: [],
      teams: [],
      workload: 12,
    };

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully.',
      data: createdStaff,
    });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to create staff member.' });
  }
};

/**
 * 4. PUT /api/admin/staff/:id
 * Update staff member details
 */
export const updateStaff = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const id = String(req.params.id);
    const {
      name,
      email,
      staffId,
      phone,
      qualification,
      subjects,
      classes,
      medium,
      status,
    } = req.body;

    const user = await prisma.user.findFirst({
  where: {
    id,
    tenantId,
    role: { in: ['TEACHER', 'ADMIN'] },
  },
  include: { teacherProfile: true },
});
    if (!user) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    const updateUserData: any = {};
    if (name) {
      const parts = name.trim().split(' ');
      updateUserData.firstName = parts[0] || user.firstName;
      updateUserData.lastName = parts.slice(1).join(' ') || user.lastName;
    }
    if (email && email !== user.email) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingEmailUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      id: { not: id },
    },
    select: { id: true },
  });

  if (existingEmailUser) {
    res.status(409).json({
      success: false,
      message: 'This email is already in use.',
    });
    return;
  }

  updateUserData.email = normalizedEmail;
}
    if (status !== undefined) {
      updateUserData.isActive = status === 'active';
    }

    if (Object.keys(updateUserData).length > 0) {
  const updateResult = await prisma.user.updateMany({
    where: {
      id,
      tenantId,
      role: { in: ['TEACHER', 'ADMIN'] },
    },
    data: updateUserData,
  });

  if (updateResult.count !== 1) {
    res.status(404).json({
      success: false,
      message: 'Staff member not found or access denied.',
    });
    return;
  }
}

    if (user.teacherProfile) {
      const updateProfileData: any = {};
      if (staffId) updateProfileData.employeeNo = staffId;
      if (phone) updateProfileData.phone = phone;
      if (subjects) {
        updateProfileData.specialization = Array.isArray(subjects) ? subjects.join(', ') : String(subjects);
      }
      if (qualification) {
        updateProfileData.qualifications = [{ degree: qualification }];
      }
      if (medium) {
        updateProfileData.mediums = [medium.charAt(0).toUpperCase() + medium.slice(1)];
      }

      if (Object.keys(updateProfileData).length > 0) {
        await prisma.teacherProfile.update({
          where: { id: user.teacherProfile.id },
          data: updateProfileData,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Staff updated successfully.',
    });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to update staff member.' });
  }
};

/**
 * 5. PATCH /api/admin/staff/:id/status
 * Toggle staff status (active / inactive / suspended)
 */
export const updateStaffStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const id = String(req.params.id);
    const { status } = req.body; // 'active' | 'inactive' | 'suspended'

    const user = await prisma.user.findFirst({
  where: {
    id,
    tenantId,
    role: { in: ['TEACHER', 'ADMIN'] },
  },
});
    if (!user) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    const isActive = status === 'active';
    const updateResult = await prisma.user.updateMany({
  where: {
    id,
    tenantId,
    role: { in: ['TEACHER', 'ADMIN'] },
  },
  data: { isActive },
});

if (updateResult.count !== 1) {
  res.status(404).json({
    success: false,
    message: 'Staff member not found or access denied.',
  });
  return;
}

    res.status(200).json({
      success: true,
      message: `Staff status updated to ${status}.`,
      data: { id, status },
    });
  } catch (error: any) {
    console.error('Error updating staff status:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

/**
 * 6. GET /api/admin/students
 * Get student directory for the school tenant
 */
export const getStudents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where: any = {
      tenantId,
      role: 'STUDENT',
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        studentProfile: {
          include: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const directory = students.map((s) => ({
      id: s.id,
      schoolId: tenantId,
      name: `${s.firstName} ${s.lastName}`.trim(),
      email: s.email,
      role: 'student' as const,
      grade: s.studentProfile?.gradeLevel || 'Grade 12',
      className: s.studentProfile?.section || 'Section A',
      status: s.isActive ? 'active' : 'inactive',
      phone: '+94 77 000 0000',
      enrolledCoursesCount: s.studentProfile?.enrollments?.length || 0,
      studentIdNo: s.studentProfile?.studentIdNo || `STU-${s.id.substring(0, 5).toUpperCase()}`,
    }));

    res.status(200).json({
      success: true,
      data: directory,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to fetch student directory.' });
  }
};

/**
 * 7. PATCH /api/admin/students/:id/status
 * Toggle student active status
 */
export const updateStudentStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const id = String(req.params.id);
    const { status } = req.body; // 'active' | 'inactive'

    const user = await prisma.user.findFirst({
  where: {
    id,
    tenantId,
    role: 'STUDENT',
  },
});
    if (!user) {
      res.status(404).json({ success: false, message: 'Student user not found.' });
      return;
    }

    const updateResult = await prisma.user.updateMany({
  where: {
    id,
    tenantId,
    role: 'STUDENT',
  },
  data: { isActive: status === 'active' },
});

if (updateResult.count !== 1) {
  res.status(404).json({
    success: false,
    message: 'Student not found or access denied.',
  });
  return;
}

    res.status(200).json({
      success: true,
      message: `Student account status updated to ${status}.`,
      data: { id, status },
    });
  } catch (error: any) {
    console.error('Error updating student status:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
};

/**
 * 8. GET /api/admin/settings
 * Fetch school tenant settings & branding
 */
export const getSchoolSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    const settings = (tenant.settings as Record<string, any>) || {};

    res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
        branding: settings.branding || {
          motto: 'Excellence in Advanced Level Education',
          phone: '+94 11 234 5678',
          email: `admin@${tenant.domain || 'limat.edu.lk'}`,
          address: 'No. 45, Science College Road, Colombo 07',
          academicYear: '2026/2027',
          principalName: 'Dr. K. S. Wickramasinghe',
          logoUrl: '',
        },
        classes: settings.classes || [],
        subjects: settings.subjects || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching school settings:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to load school settings.' });
  }
};

/**
 * 9. PUT /api/admin/settings
 * Save school tenant settings & branding
 */
export const updateSchoolSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const { name, domain, branding, classes, subjects } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    const currentSettings = (tenant.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(branding ? { branding: { ...(currentSettings.branding || {}), ...branding } } : {}),
      ...(classes ? { classes } : {}),
      ...(subjects ? { subjects } : {}),
    };

    const updateData: any = {
      settings: updatedSettings,
    };
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'School settings and branding saved successfully.',
      data: {
        id: updated.id,
        name: updated.name,
        domain: updated.domain,
        settings: updated.settings,
      },
    });
  } catch (error: any) {
    console.error('Error updating school settings:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to save school settings.' });
  }
};

/**
 * 10. POST /api/admin/students
 * Register a new student in tenant directory
 */
export const createStudent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const { name, email, grade, section, studentIdNo } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const [firstName, ...restName] = String(name).trim().split(' ');
    const lastName = restName.join(' ') || 'Student';
    const idNo = studentIdNo || `STU-${Math.floor(10000 + Math.random() * 90000)}`;

    const setupToken = generateSetupToken();
    const setupTokenHash = hashSetupToken(setupToken);
    const passwordHash = await bcrypt.hash(setupToken, 12);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    let user: any;
    let profile: any;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      user = await tx.user.create({
        data: {
          tenantId,
          email: cleanEmail,
          passwordHash,
          mustChangePassword: true,
          firstName,
          lastName,
          role: 'STUDENT',
          isActive: true,
        },
      });

      profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentIdNo: idNo,
          gradeLevel: grade || 'Grade 12',
          section: section || 'Physical Science',
        },
      });

      await tx.setupToken.create({
        data: {
          userId: user.id,
          tenantId,
          tokenHash: setupTokenHash,
          expiresAt,
          createdAt: new Date(),
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully in directory.',
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: 'student',
        studentId: profile.studentIdNo,
        grade: profile.gradeLevel,
        section: profile.section,
        status: 'active',
      },
    });
  } catch (error: any) {
    console.error('Error creating student in admin:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to create student.' });
  }
};

export const deliverSetupLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const userId = String(req.params.id);
    const setupToken = generateSetupToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: userId,
          tenantId,
          isActive: true,
          role: { in: ['ADMIN', 'TEACHER', 'STUDENT'] },
        },
        select: { id: true },
      });

      if (!user) return null;

      await tx.setupToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: now },
      });

      return tx.setupToken.create({
        data: {
          userId: user.id,
          tenantId,
          tokenHash: hashSetupToken(setupToken),
          expiresAt,
        },
        select: { expiresAt: true },
      });
    });

    if (!created) {
      res.status(404).json({ success: false, message: 'Active user not found.' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      message: 'One-time setup link generated. Deliver it through your approved secure channel.',
      setupLink: `${config.frontendUrl}/setup-password#token=${encodeURIComponent(setupToken)}&tenantId=${encodeURIComponent(tenantId)}`,
      expiresAt: created.expiresAt,
    });
  } catch (error: any) {
    console.error('Error generating setup link:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to generate setup link.' });
  }
};

/**
 * 11. DELETE /api/admin/users/:id
 * Remove a user from directory
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const tenantId = await resolveTenantId(req);

const user = await prisma.user.findFirst({
  where: {
    id,
    tenantId,
    role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] },
  },
});
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'User removed from directory successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting user in admin:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

/**
 * 12. GET /api/admin/classes
 * Fetch all academic classes for the active tenant
 */
export const getClasses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Organization not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const classes = Array.isArray(settings.classes) ? settings.classes : [];
    res.status(200).json({ success: true, data: classes });
  } catch (error: unknown) {
    console.error('Error in getClasses:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
  }
};

/**
 * 13. POST /api/admin/classes
 * Create a new academic class stream
 */
export const createClass = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const { name, gradeId, gradeName, classTeacherId, classTeacherName, studentCount } = req.body;
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Class name is required.' });
      return;
    }

    const newClass = {
      id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      gradeId: gradeId || 'grd_12',
      gradeName: gradeName || 'Grade 12 (A/L)',
      classTeacherId: classTeacherId || 'usr_teacher_01',
      classTeacherName: classTeacherName || 'Class Teacher',
      studentCount: typeof studentCount === 'number' ? studentCount : 35,
    };

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
        settings: {
          ...settings,
          classes: [newClass, ...existingClasses],
        },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully.',
      data: newClass,
    });
  } catch (error: unknown) {
    console.error('Error in createClass:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to create class.' });
  }
};

/**
 * 14. PUT /api/admin/classes/:id
 * Update an existing academic class stream
 */
export const updateClass = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const classId = String(req.params.id);
    const { name, gradeId, gradeName, classTeacherId, classTeacherName, studentCount } = req.body;

    let updatedItem: Record<string, any> | undefined;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];
      const index = existingClasses.findIndex((c) => c.id === classId);
      if (index === -1) throw new TenantResolutionError(404, 'Class not found');

      updatedItem = {
        ...existingClasses[index],
        ...(name !== undefined && { name: String(name).trim() }),
        ...(gradeId !== undefined && { gradeId }),
        ...(gradeName !== undefined && { gradeName }),
        ...(classTeacherId !== undefined && { classTeacherId }),
        ...(classTeacherName !== undefined && { classTeacherName }),
        ...(studentCount !== undefined && { studentCount }),
        id: classId,
      };
      const updatedClasses = [...existingClasses];
      updatedClasses[index] = updatedItem;

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settings,
            classes: updatedClasses,
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully.',
      data: updatedItem,
    });
  } catch (error: unknown) {
    console.error('Error in updateClass:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to update class.' });
  }
};

/**
 * 15. DELETE /api/admin/classes/:id
 * Remove a class stream
 */
export const deleteClass = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const classId = String(req.params.id);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];
      if (!existingClasses.some((c) => c.id === classId)) {
        throw new TenantResolutionError(404, 'Class not found');
      }

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settings,
            classes: existingClasses.filter((c) => c.id !== classId),
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Class removed successfully.',
      data: { id: classId },
    });
  } catch (error: unknown) {
    console.error('Error in deleteClass:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to delete class.' });
  }
};

/**
 * 16. GET /api/admin/subjects
 * Fetch all curriculum subjects
 */
export const getSubjects = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Organization not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const subjects = Array.isArray(settings.subjects) ? settings.subjects : [];
    res.status(200).json({ success: true, data: subjects });
  } catch (error: unknown) {
    console.error('Error in getSubjects:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
};

/**
 * 17. POST /api/admin/subjects
 * Add a subject to curriculum
 */
export const createSubject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const { name, code, gradeId, gradeName, color } = req.body;
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Subject name is required.' });
      return;
    }

    let newSub: Record<string, any> | undefined;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];
      newSub = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: String(name).trim(),
        code: String(code || `SUB-${existingSubjects.length + 1}`).trim().toUpperCase(),
        gradeId: gradeId || 'grd_12',
        gradeName: gradeName || 'Grade 12 (A/L)',
        color: color || 'from-blue-600 to-indigo-700',
      };

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settings,
            subjects: [newSub, ...existingSubjects],
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Subject added to curriculum successfully.',
      data: newSub,
    });
  } catch (error: unknown) {
    console.error('Error in createSubject:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to create subject.' });
  }
};

/**
 * 18. PUT /api/admin/subjects/:id
 * Update subject details
 */
export const updateSubject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const subjectId = String(req.params.id);
    const { name, code, gradeId, gradeName, color } = req.body;
    let updatedItem: Record<string, any> | undefined;

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];
      const index = existingSubjects.findIndex((s) => s.id === subjectId);
      if (index === -1) throw new TenantResolutionError(404, 'Subject not found');

      updatedItem = {
        ...existingSubjects[index],
        ...(name !== undefined && { name: String(name).trim() }),
        ...(code !== undefined && { code: String(code).trim().toUpperCase() }),
        ...(gradeId !== undefined && { gradeId }),
        ...(gradeName !== undefined && { gradeName }),
        ...(color !== undefined && { color }),
        id: subjectId,
      };
      const updatedSubjects = [...existingSubjects];
      updatedSubjects[index] = updatedItem;

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settings,
            subjects: updatedSubjects,
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Subject details updated successfully.',
      data: updatedItem,
    });
  } catch (error: unknown) {
    console.error('Error in updateSubject:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to update subject.' });
  }
};

/**
 * 19. DELETE /api/admin/subjects/:id
 * Remove subject from curriculum
 */
export const deleteSubject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = await resolveTenantId(req);
    const subjectId = String(req.params.id);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Tenant"
        WHERE "id" = ${tenantId}
        FOR UPDATE
      `;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new TenantResolutionError(404, 'Organization not found');

      const settings = (tenant.settings as Record<string, any>) || {};
      const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];
      if (!existingSubjects.some((s) => s.id === subjectId)) {
        throw new TenantResolutionError(404, 'Subject not found');
      }

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...settings,
            subjects: existingSubjects.filter((s) => s.id !== subjectId),
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Subject removed from curriculum successfully.',
      data: { id: subjectId },
    });
  } catch (error: unknown) {
    console.error('Error in deleteSubject:', error);
    if (sendTenantResolutionError(res, error)) return;
    res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
};
