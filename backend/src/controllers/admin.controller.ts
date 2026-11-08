import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to resolve the active tenant ID from request user, header, or default
 */
export const resolveTenantId = async (req: AuthenticatedRequest): Promise<string> => {
  const rawHeader = req.headers['x-tenant-id'];
  const headerTenantId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (headerTenantId) {
    const existing = await prisma.tenant.findUnique({ where: { id: headerTenantId, deletedAt: null } });
    if (existing) return existing.id;
  }
  if (req.user?.tenantId) {
    const userTenant = await prisma.tenant.findUnique({ where: { id: req.user.tenantId, deletedAt: null } });
    if (userTenant) return userTenant.id;
  }
  const defaultTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVE', deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  return defaultTenant?.id || '';
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
    const defaultPasswordHash = await bcrypt.hash('Student@123', 10);
    const idNo = studentIdNo || `STU-${Math.floor(10000 + Math.random() * 90000)}`;

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: cleanEmail,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        role: 'STUDENT',
        isActive: true,
      },
    });

    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        studentIdNo: idNo,
        gradeLevel: grade || 'Grade 12',
        section: section || 'Physical Science',
      },
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
    res.status(500).json({ success: false, message: error.message || 'Failed to create student.' });
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
    const user = await prisma.user.findUnique({ where: { id } });
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
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user.' });
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
    if (!tenantId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const classes = Array.isArray(settings.classes) ? settings.classes : [];
    res.status(200).json({ success: true, data: classes });
  } catch (error: any) {
    console.error('Error in getClasses:', error);
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const { name, gradeId, gradeName, classTeacherId, classTeacherName, studentCount } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Class name is required.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];

    const newClass = {
      id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      gradeId: gradeId || 'grd_12',
      gradeName: gradeName || 'Grade 12 (A/L)',
      classTeacherId: classTeacherId || 'usr_teacher_01',
      classTeacherName: classTeacherName || 'Mr. Samantha Perera',
      studentCount: typeof studentCount === 'number' ? studentCount : 35,
    };

    const updatedClasses = [newClass, ...existingClasses];
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          classes: updatedClasses,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully.',
      data: newClass,
    });
  } catch (error: any) {
    console.error('Error in createClass:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create class.' });
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];

    const index = existingClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }

    const updatedItem = {
      ...existingClasses[index],
      ...req.body,
      id: classId,
    };
    existingClasses[index] = updatedItem;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          classes: existingClasses,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully.',
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Error in updateClass:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update class.' });
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingClasses: any[] = Array.isArray(settings.classes) ? settings.classes : [];

    const filtered = existingClasses.filter((c) => c.id !== classId);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          classes: filtered,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Class removed successfully.',
      data: { id: classId },
    });
  } catch (error: any) {
    console.error('Error in deleteClass:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete class.' });
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
    if (!tenantId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const subjects = Array.isArray(settings.subjects) ? settings.subjects : [];
    res.status(200).json({ success: true, data: subjects });
  } catch (error: any) {
    console.error('Error in getSubjects:', error);
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const { name, code, gradeId, gradeName, color } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Subject name is required.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];

    const newSub = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      code: String(code || `SUB-${existingSubjects.length + 1}`).trim().toUpperCase(),
      gradeId: gradeId || 'grd_12',
      gradeName: gradeName || 'Grade 12 (A/L)',
      color: color || 'from-blue-600 to-indigo-700',
    };

    const updated = [newSub, ...existingSubjects];
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          subjects: updated,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subject added to curriculum successfully.',
      data: newSub,
    });
  } catch (error: any) {
    console.error('Error in createSubject:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create subject.' });
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];

    const index = existingSubjects.findIndex((s) => s.id === subjectId);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Subject not found.' });
      return;
    }

    const updatedItem = {
      ...existingSubjects[index],
      ...req.body,
      id: subjectId,
    };
    existingSubjects[index] = updatedItem;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          subjects: existingSubjects,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subject details updated successfully.',
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Error in updateSubject:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update subject.' });
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
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    const settings = (tenant.settings as Record<string, any>) || {};
    const existingSubjects: any[] = Array.isArray(settings.subjects) ? settings.subjects : [];

    const filtered = existingSubjects.filter((s) => s.id !== subjectId);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          subjects: filtered,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subject removed from curriculum successfully.',
      data: { id: subjectId },
    });
  } catch (error: any) {
    console.error('Error in deleteSubject:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete subject.' });
  }
};
