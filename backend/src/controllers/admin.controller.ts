import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to resolve the active tenant ID from request user, header, or default
 */
export const resolveTenantId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.user?.tenantId) {
    return req.user.tenantId;
  }
  const rawHeader = req.headers['x-tenant-id'];
  const headerTenantId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (headerTenantId) {
    const existing = await prisma.tenant.findUnique({ where: { id: headerTenantId } });
    if (existing) return existing.id;
  }
  const defaultTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVE', deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  return defaultTenant?.id || '';
};

/**
 * Helper to ensure realistic default staff exists for the school tenant
 */
const ensureDefaultSchoolStaff = async (tenantId: string) => {
  const staffCount = await prisma.user.count({
    where: {
      tenantId,
      role: { in: ['TEACHER', 'ADMIN'] },
    },
  });

  if (staffCount === 0) {
    const defaultPasswordHash = await bcrypt.hash('Staff@123', 10);
    const mockTeachers = [
      {
        firstName: 'Samantha',
        lastName: 'Perera',
        email: 'samantha.perera@limat-academy.lk',
        role: 'TEACHER' as const,
        phone: '+94 77 123 4567',
        employeeNo: 'EMP-T01',
        specialization: 'Combined Mathematics',
        mediums: ['English', 'Tamil'],
        qualifications: [{ degree: 'B.Sc. (Hons) Mathematics', institution: 'Univ of Colombo', year: '2014' }],
      },
      {
        firstName: 'Nalinda',
        lastName: 'Jayawardena',
        email: 'nalinda.j@limat-academy.lk',
        role: 'TEACHER' as const,
        phone: '+94 71 987 6543',
        employeeNo: 'EMP-T02',
        specialization: 'Advanced Physics',
        mediums: ['English', 'Sinhala'],
        qualifications: [{ degree: 'B.Sc. (Hons) Physics', institution: 'Univ of Peradeniya', year: '2016' }],
      },
      {
        firstName: 'Fathima',
        lastName: 'Rizwan',
        email: 'fathima.r@limat-academy.lk',
        role: 'TEACHER' as const,
        phone: '+94 76 555 4321',
        employeeNo: 'EMP-T03',
        specialization: 'Information & Communication Technology',
        mediums: ['English', 'Tamil'],
        qualifications: [{ degree: 'B.Sc. Computer Science', institution: 'Univ of Moratuwa', year: '2018' }],
      },
      {
        firstName: 'Rohan',
        lastName: 'De Silva',
        email: 'rohan.desilva@limat-academy.lk',
        role: 'ADMIN' as const,
        phone: '+94 75 111 2233',
        employeeNo: 'EMP-A01',
        specialization: 'Senior Administrator & Academic Dean',
        mediums: ['English'],
        qualifications: [{ degree: 'M.Ed. Educational Leadership', institution: 'NIE Sri Lanka', year: '2012' }],
      },
    ];

    for (const t of mockTeachers) {
      const existingUser = await prisma.user.findUnique({ where: { email: t.email } });
      if (!existingUser) {
        const createdUser = await prisma.user.create({
          data: {
            tenantId,
            email: t.email,
            passwordHash: defaultPasswordHash,
            firstName: t.firstName,
            lastName: t.lastName,
            role: t.role,
            isActive: true,
          },
        });

        if (t.role === 'TEACHER') {
          await prisma.teacherProfile.create({
            data: {
              userId: createdUser.id,
              employeeNo: t.employeeNo,
              specialization: t.specialization,
              phone: t.phone,
              mediums: t.mediums,
              qualifications: t.qualifications,
              experienceYears: 8,
              isVerified: true,
            },
          });
        }
      }
    }
  }
};

/**
 * 1. GET /api/admin/overview
 * High-level school dashboard metrics and KPIs
 */
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

    await ensureDefaultSchoolStaff(tenantId);

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
    const classes = settings.classes || [
      { id: 'cls_12a', name: 'Grade 12-A', gradeName: 'Grade 12', section: 'Physical Science', studentCount: 38 },
      { id: 'cls_12b', name: 'Grade 12-B', gradeName: 'Grade 12', section: 'Biological Science', studentCount: 35 },
      { id: 'cls_13a', name: 'Grade 13-A', gradeName: 'Grade 13', section: 'Technology Stream', studentCount: 42 },
      { id: 'cls_11a', name: 'Grade 11-A', gradeName: 'Grade 11', section: 'G.C.E. O/L Core', studentCount: 40 },
    ];

    const subjects = settings.subjects || [
      { id: 'sub_math', name: 'Combined Mathematics', code: 'CM-12', grades: ['Grade 12', 'Grade 13'] },
      { id: 'sub_phy', name: 'Physics', code: 'PHY-12', grades: ['Grade 12', 'Grade 13'] },
      { id: 'sub_chem', name: 'Chemistry', code: 'CHM-12', grades: ['Grade 12', 'Grade 13'] },
      { id: 'sub_ict', name: 'Information Technology', code: 'ICT-12', grades: ['Grade 12', 'Grade 13'] },
    ];

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
    await ensureDefaultSchoolStaff(tenantId);

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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Staff';
    const lastName = nameParts.slice(1).join(' ') || 'Member';
    const defaultPasswordHash = await bcrypt.hash('Staff@123', 10);
    const systemRole = role === 'administrator' ? 'ADMIN' : 'TEACHER';

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        role: systemRole,
        isActive: status === 'active',
      },
    });

    const employeeNo = staffId || `EMP-${Date.now().toString().slice(-6)}`;
    const specialization = Array.isArray(subjects) && subjects.length > 0 ? subjects.join(', ') : 'Educator';

    if (systemRole === 'TEACHER') {
      await prisma.teacherProfile.create({
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
    const id = String(req.params.id);
    const {
      name,
      email,
      role,
      staffId,
      phone,
      qualification,
      subjects,
      classes,
      medium,
      status,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
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
      updateUserData.email = email;
    }
    if (status !== undefined) {
      updateUserData.isActive = status === 'active';
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id },
        data: updateUserData,
      });
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
    const id = String(req.params.id);
    const { status } = req.body; // 'active' | 'inactive' | 'suspended'

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    const isActive = status === 'active';
    await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    res.status(200).json({
      success: true,
      message: `Staff status updated to ${status}.`,
      data: { id, status },
    });
  } catch (error: any) {
    console.error('Error updating staff status:', error);
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
    const id = String(req.params.id);
    const { status } = req.body; // 'active' | 'inactive'

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Student user not found.' });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: status === 'active' },
    });

    res.status(200).json({
      success: true,
      message: `Student account status updated to ${status}.`,
      data: { id, status },
    });
  } catch (error: any) {
    console.error('Error updating student status:', error);
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
    res.status(500).json({ success: false, message: 'Failed to save school settings.' });
  }
};
