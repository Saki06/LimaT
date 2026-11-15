import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { Role } from '@prisma/client';

const googleClient = new OAuth2Client(config.googleClientId);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: 'insensitive',
        },
      },
      include: {
        tenant: true,
        studentProfile: true,
        teacherProfile: {
          select: {
            id: true,
            userId: true,
            employeeNo: true,
            specialization: true,
          },
        },
        parentProfile: true,
      },
    });

    if (!user) {
  res.status(401).json({
    success: false,
    message: 'Invalid email or password.',
  });
  return;
}

if (!user.isActive) {
  res.status(403).json({
    success: false,
    message: 'Your account is inactive. Please contact the administrator.',
  });
  return;
}

// Only global Super Admin can log in without a tenant
if (!user.tenantId && user.role !== Role.SUPER_ADMIN) {
  res.status(403).json({
    success: false,
    message: 'Your account is not assigned to an organization.',
  });
  return;
}

    if (expectedRole) {
      const normalizedExpected = String(expectedRole).toUpperCase();
      const roleDisplayNames: Record<string, string> = {
        STUDENT: 'Student',
        TEACHER: 'Tutor',
        PARENT: 'Parent',
        ADMIN: 'Admin',
        SUPER_ADMIN: 'Super Admin',
      };

      if (user.role !== normalizedExpected) {
        const actualRoleName = roleDisplayNames[user.role] || user.role;
        res.status(403).json({
          success: false,
          message: `This account is registered as a ${actualRoleName}. Please switch to the ${actualRoleName} Portal to sign in.`,
        });
        return;
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Validate tenant status before issuing a JWT (except Super Admin)
    if (user.tenantId && user.role !== 'SUPER_ADMIN') {
      const tenant = await prisma.tenant.findUnique({
  where: { id: user.tenantId },
  select: {
    status: true,
    deletedAt: true,
  },
});

  if (
  !tenant ||
  tenant.deletedAt !== null ||
  tenant.status === 'SUSPENDED' ||
  tenant.status === 'INACTIVE'
) {
    res.status(403).json({
      success: false,
      message: 'Your organization is currently inactive or suspended.',
    });
    return;
  }
}

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenant: user.tenant,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
        parentProfile: user.parentProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, gradeLevel, section, studentIdNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required student registration fields' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    // Default to first tenant if none specified
    let selectedTenantId = tenantId;
    if (!selectedTenantId) {
      const defaultTenant = await prisma.tenant.findFirst({
  where: {
    deletedAt: null,
    status: { notIn: ['SUSPENDED', 'INACTIVE'] },
  },
});
      selectedTenantId = defaultTenant?.id;
    }

    if (!selectedTenantId) {
      res.status(400).json({ success: false, message: 'No valid tenant found to register student' });
      return;
    }

    const selectedTenant = await prisma.tenant.findUnique({
  where: { id: selectedTenantId },
  select: {
  status: true,
  deletedAt: true,
},
});

if (
  !selectedTenant ||
  selectedTenant.deletedAt !== null ||
  selectedTenant.status === 'SUSPENDED' ||
  selectedTenant.status === 'INACTIVE'
) {
  res.status(403).json({
    success: false,
    message: 'Registration is unavailable for this organization.',
  });
  return;
}

    const passwordHash = await bcrypt.hash(password, 10);

    let generatedStudentIdNo = typeof studentIdNo === 'string' && studentIdNo.trim()
      ? studentIdNo.trim()
      : '';

    if (!generatedStudentIdNo) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
        const existingId = await prisma.studentProfile.findUnique({
          where: { studentIdNo: candidate },
          select: { id: true },
        });
        if (!existingId) {
          generatedStudentIdNo = candidate;
          break;
        }
      }
      if (!generatedStudentIdNo) {
        generatedStudentIdNo = `STU-${Date.now().toString().slice(-6)}`;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        tenantId: selectedTenantId,
        email: normalizedEmail,
        passwordHash,
        role: Role.STUDENT,
        firstName,
        lastName: lastName || '',
        studentProfile: {
          create: {
            studentIdNo: generatedStudentIdNo,
            gradeLevel: gradeLevel || 'Grade 10',
            section: section || null,
            phoneNumber: typeof phoneNumber === 'string' && phoneNumber.trim() ? phoneNumber.trim() : null,
          },
        },
      },
      include: { studentProfile: true },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Register student error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, specialization, employeeNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required tutor fields' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    // Hash password before starting transaction
    const passwordHash = await bcrypt.hash(password, 10);

    const fullTutorName = `${firstName} ${lastName || ''}`.trim();
    const baseSlug =
      fullTutorName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'tutor';

    const newUser = await prisma.$transaction(async (tx) => {
      // Re-check inside transaction to avoid race conditions
      const userInTx = await tx.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (userInTx) {
        const err: any = new Error('Email already registered.');
        err.statusCode = 409;
        throw err;
      }

      let selectedTenantId = tenantId;
      if (!selectedTenantId) {
        let candidateSlug = baseSlug;
        const existingSlug = await tx.tenant.findUnique({ where: { slug: candidateSlug } });
        if (existingSlug) {
          candidateSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const createdStudioTenant = await tx.tenant.create({
          data: {
            name: fullTutorName,
            slug: candidateSlug,
            domain: `${candidateSlug}.newtoz.com`,
            plan: 'PRO',
            status: 'ACTIVE',
            settings: {
              adminName: fullTutorName,
              adminEmail: normalizedEmail,
              contactPhone: typeof phoneNumber === 'string' ? phoneNumber.trim() : '',
              type: 'individual_teacher',
              tagline: `${specialization || 'Science & Mathematics'} Educator Studio`,
              subjects: [specialization || 'Science & Mathematics'],
            },
          },
        });
        selectedTenantId = createdStudioTenant.id;
      }

      if (!selectedTenantId) {
        const err: any = new Error('No valid tenant found to register teacher.');
        err.statusCode = 400;
        throw err;
      }

      const selectedTenant = await tx.tenant.findUnique({
        where: { id: selectedTenantId },
        select: {
          status: true,
          deletedAt: true,
        },
      });

      if (
        !selectedTenant ||
        selectedTenant.deletedAt !== null ||
        selectedTenant.status === 'SUSPENDED' ||
        selectedTenant.status === 'INACTIVE'
      ) {
        const err: any = new Error('Registration is unavailable for this organization.');
        err.statusCode = 403;
        throw err;
      }

      return tx.user.create({
        data: {
          tenantId: selectedTenantId,
          email: normalizedEmail,
          passwordHash,
          role: Role.TEACHER,
          firstName,
          lastName: lastName || '',
          teacherProfile: {
            create: {
              specialization: specialization || 'General Science',
              employeeNo: employeeNo || 'FAC-' + Math.floor(1000 + Math.random() * 9000),
            },
          },
        },
        include: { teacherProfile: true },
      });
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Tutor registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Register tutor error:', error);
    if (error.statusCode === 409 || error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }
    if (error.statusCode === 403) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, childStudentId, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required parent fields' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    let selectedTenantId = tenantId;
    if (!selectedTenantId) {
      const defaultTenant = await prisma.tenant.findFirst({
  where: {
    deletedAt: null,
    status: { notIn: ['SUSPENDED', 'INACTIVE'] },
  },
});
      selectedTenantId = defaultTenant?.id;
    }

    if (!selectedTenantId) {
  res.status(400).json({
    success: false,
    message: 'No valid tenant found to register parent.',
  });
  return;
}

const selectedTenant = await prisma.tenant.findUnique({
  where: { id: selectedTenantId },
  select: {
  status: true,
  deletedAt: true,
},
});

if (
  !selectedTenant ||
  selectedTenant.deletedAt !== null ||
  selectedTenant.status === 'SUSPENDED' ||
  selectedTenant.status === 'INACTIVE'
) {
  res.status(403).json({
    success: false,
    message: 'Registration is unavailable for this organization.',
  });
  return;
}

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId: selectedTenantId!,
        email: normalizedEmail,
        passwordHash,
        role: Role.PARENT,
        firstName,
        lastName: lastName || '',
        parentProfile: {
          create: {
            phoneNumber: phoneNumber || null,
          },
        },
      },
      include: { parentProfile: true },
    });

    if (newUser.parentProfile && typeof childStudentId === 'string' && childStudentId.trim()) {
      const cleanRef = childStudentId.trim();
      const digitsOnly = cleanRef.replace(/\D/g, '');
      const matchedStudent = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            { studentIdNo: { equals: cleanRef, mode: 'insensitive' } },
            ...(digitsOnly.length >= 7
              ? [
                  { phoneNumber: { contains: digitsOnly.slice(-9) } },
                  { phoneNumber: { equals: cleanRef } },
                ]
              : []),
            { user: { email: { equals: cleanRef, mode: 'insensitive' } } },
          ],
        },
        select: { id: true },
      });

      if (matchedStudent) {
        await prisma.studentProfile.update({
          where: { id: matchedStudent.id },
          data: { guardianId: newUser.parentProfile.id },
        });
      }
    }

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Register parent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, requestedRole, tenantId } = req.body;

    if (!credential) {
      res.status(400).json({ success: false, message: 'Google credential token is required' });
      return;
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
    } catch (verError: any) {
      console.error('Google ID token verification failed:', verError);
      res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Unable to extract email from Google token' });
      return;
    }

    const email = payload.email.trim().toLowerCase();
    const firstName = payload.given_name || payload.name?.split(' ')[0] || 'User';
    const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
    const avatarUrl = payload.picture || null;

    let user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
      include: {
        tenant: true,
        studentProfile: true,
        teacherProfile: {
          select: {
            id: true,
            userId: true,
            employeeNo: true,
            specialization: true,
          },
        },
        parentProfile: true,
      },
    });

    if (user) {
      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact the administrator.',
        });
        return;
      }

      if (requestedRole) {
        const normalizedRequested = String(requestedRole).toUpperCase();
        const roleDisplayNames: Record<string, string> = {
          STUDENT: 'Student',
          TEACHER: 'Tutor',
          PARENT: 'Parent',
          ADMIN: 'Admin',
          SUPER_ADMIN: 'Super Admin',
        };

        if (user.role !== normalizedRequested) {
          const actualRoleName = roleDisplayNames[user.role] || user.role;
          res.status(403).json({
            success: false,
            message: `This Google account is registered as a ${actualRoleName}. Please switch to the ${actualRoleName} Portal to sign in.`,
          });
          return;
        }
      }

      if (avatarUrl && !user.avatarUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
      }

      const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        message: 'Logged in with Google successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl || avatarUrl,
          tenant: user.tenant,
          studentProfile: user.studentProfile,
          teacherProfile: user.teacherProfile,
          parentProfile: user.parentProfile,
        },
      });
      return;
    }

    // If user does not exist yet, they need to register via Google
    // Check if role is provided
    const targetRole = String(requestedRole || 'STUDENT').toUpperCase();
    if (!['STUDENT', 'TEACHER', 'PARENT'].includes(targetRole)) {
      res.status(400).json({
        success: false,
        needsRegistration: true,
        googleUser: { email, firstName, lastName, avatarUrl },
        message: 'Select whether you are registering as a Student, Tutor, or Parent.',
      });
      return;
    }

    // Resolve tenantId
    let selectedTenantId = tenantId;
    if (!selectedTenantId) {
      const defaultTenant = await prisma.tenant.findFirst({
        where: { deletedAt: null, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });
      selectedTenantId = defaultTenant?.id || null;
    }

    const randomPassword = `G_${Math.random().toString(36).slice(-10)}_${Date.now()}`;
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    if (targetRole === 'TEACHER') {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedEmployeeNo = `TUT-${randomNum}`;
      const tutorSlug = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

      user = await prisma.$transaction(async (tx) => {
        const existingTxUser = await tx.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
          include: {
            tenant: true,
            studentProfile: true,
            teacherProfile: true,
            parentProfile: true,
          },
        });
        if (existingTxUser) return existingTxUser;

        const newTenant = await tx.tenant.create({
          data: {
            name: `${firstName} ${lastName}`.trim() || 'Educator Studio',
            slug: tutorSlug,
            domain: `${tutorSlug}.newtoz.com`,
            plan: 'PRO',
            settings: {
              adminName: `${firstName} ${lastName}`.trim(),
              adminEmail: email,
              contactPhone: '',
              studentCount: 0,
              teacherCount: 1,
              subjects: ['General Academics'],
              monthlyFeeLkr: 0,
              type: 'individual_teacher',
              enabledFeatures: {
                batch_management: true,
                tuition_subscriptions: true,
                course_marketplace: true,
                live_broadcast_studio: true,
                syllabus_builder: true,
                assignments_grading: true,
                tutor_branding: false,
              },
            },
          },
        });

        return tx.user.create({
          data: {
            email,
            passwordHash,
            role: Role.TEACHER,
            firstName,
            lastName,
            avatarUrl,
            tenantId: newTenant.id,
            teacherProfile: {
              create: {
                employeeNo: generatedEmployeeNo,
                specialization: 'General Academics',
                publicSlug: tutorSlug,
              },
            },
          },
          include: {
            tenant: true,
            studentProfile: true,
            teacherProfile: {
              select: {
                id: true,
                userId: true,
                employeeNo: true,
                specialization: true,
              },
            },
            parentProfile: true,
          },
        });
      });
    } else if (targetRole === 'PARENT') {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: Role.PARENT,
          firstName,
          lastName,
          avatarUrl,
          tenantId: selectedTenantId,
          parentProfile: {
            create: {},
          },
        },
        include: {
          tenant: true,
          studentProfile: true,
          teacherProfile: {
            select: {
              id: true,
              userId: true,
              employeeNo: true,
              specialization: true,
            },
          },
          parentProfile: true,
        },
      });
    } else {
      // Default: STUDENT
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const studentIdNo = `STU-${randomNum}`;

      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: Role.STUDENT,
          firstName,
          lastName,
          avatarUrl,
          tenantId: selectedTenantId,
          studentProfile: {
            create: {
              studentIdNo,
              gradeLevel: 'Grade 12',
            },
          },
        },
        include: {
          tenant: true,
          studentProfile: true,
          teacherProfile: {
            select: {
              id: true,
              userId: true,
              employeeNo: true,
              specialization: true,
            },
          },
          parentProfile: true,
        },
      });
    }

    if (!user) {
      res.status(500).json({ success: false, message: 'Failed to create user account' });
      return;
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created with Google successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        tenant: user.tenant,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
        parentProfile: user.parentProfile,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during Google Authentication' });
  }
};
