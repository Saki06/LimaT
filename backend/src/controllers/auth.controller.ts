import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { Role } from '@prisma/client';
import { validatePasswordChange, validatePasswordStrength } from '../utils/passwordPolicy';
import { hashSetupToken } from '../utils/setupToken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service';
import { createOtpChallenge, OtpConfigurationError, OtpLimitError, verifyOtpChallenge } from '../services/otp.service';

const googleClient = new OAuth2Client(config.googleClientId || undefined);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
  where: { email },
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
      mustChangePassword: user.mustChangePassword,
      tokenVersion: user.tokenVersion,
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
        mustChangePassword: user.mustChangePassword,
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
    const { firstName, lastName, email, password, gradeLevel, section, gender, medium, district, stream, phoneNumber, studentIdNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required student registration fields' });
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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

    const newUser = await prisma.user.create({
      data: {
        tenantId: selectedTenantId,
        email,
        passwordHash,
        role: Role.STUDENT,
        firstName,
        lastName: lastName || '',
        studentProfile: {
          create: {
            studentIdNo: studentIdNo || 'STU-' + Math.floor(1000 + Math.random() * 9000),
            gradeLevel: gradeLevel || 'Grade 10',
            section: section || null,
            phoneNumber: phoneNumber || null,
            gender: gender || null,
            medium: medium || null,
            district: district || null,
            stream: stream || null,
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
        tokenVersion: newUser.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tokenVersion: newUser.tokenVersion,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        mustChangePassword: newUser.mustChangePassword,
        studentProfile: newUser.studentProfile ? {
          id: newUser.studentProfile.id,
          studentIdNo: newUser.studentProfile.studentIdNo,
          gradeLevel: newUser.studentProfile.gradeLevel,
          section: newUser.studentProfile.section,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Register student error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, specialization, employeeNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required tutor fields' });
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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
    message: 'No valid tenant found to register teacher.',
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
        email,
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

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tokenVersion: newUser.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Tutor registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        mustChangePassword: newUser.mustChangePassword,
        teacherProfile: newUser.teacherProfile ? {
          id: newUser.teacherProfile.id,
          employeeNo: newUser.teacherProfile.employeeNo,
          specialization: newUser.teacherProfile.specialization,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Register tutor error:', error);
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

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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
        email,
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

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tokenVersion: newUser.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        mustChangePassword: newUser.mustChangePassword,
        parentProfile: newUser.parentProfile ? {
          id: newUser.parentProfile.id,
          phoneNumber: newUser.parentProfile.phoneNumber,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Register parent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};



export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const validation = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.message,
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
      return;
    }

    const currentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!currentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          mustChangePassword: false,
          tokenVersion: { increment: 1 },
        },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          mustChangePassword: true,
          tokenVersion: true,
        },
      });

      await tx.setupToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      return updated;
    });

    const token = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        mustChangePassword: false,
        tokenVersion: updatedUser.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      token,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to change password.',
    });
  }
};

const setupTokenError = (res: Response): void => {
  res.status(400).json({
    success: false,
    message: 'Invalid, expired, used, or unauthorized setup token.',
  });
};

export const validateSetupToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { setupToken, tenantId } = req.body;
    if (typeof setupToken !== 'string' || setupToken.length === 0) {
      setupTokenError(res);
      return;
    }

    const tokenHash = hashSetupToken(setupToken);
    const token = await prisma.setupToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        tenantId: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            tenantId: true,
          },
        },
        tenant: {
          select: { status: true, deletedAt: true },
        },
        expiresAt: true,
      },
    });

    if (
      !token ||
      (tenantId !== undefined && tenantId !== token.tenantId) ||
      !token.user.isActive ||
      token.user.tenantId !== token.tenantId ||
      token.tenant.deletedAt !== null ||
      token.tenant.status !== 'ACTIVE'
    ) {
      setupTokenError(res);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: token.user.id,
          email: token.user.email,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
        },
        tenantId: token.tenantId,
        expiresAt: token.expiresAt,
      },
    });
  } catch (error) {
    console.error('Setup token validation error:', error);
    res.status(500).json({ success: false, message: 'Unable to validate setup token.' });
  }
};

export const setupPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { setupToken, newPassword, confirmPassword, tenantId } = req.body;
    if (
      typeof setupToken !== 'string' ||
      typeof newPassword !== 'string' ||
      typeof confirmPassword !== 'string' ||
      newPassword !== confirmPassword
    ) {
      setupTokenError(res);
      return;
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const tokenHash = hashSetupToken(setupToken);
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const token = await tx.setupToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true, tenantId: true, userId: true },
      });

      if (!token || (tenantId !== undefined && tenantId !== token.tenantId)) {
        return null;
      }

      const user = await tx.user.findFirst({
        where: {
          id: token.userId,
          tenantId: token.tenantId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          firstName: true,
          lastName: true,
        },
      });
      const tenant = await tx.tenant.findFirst({
        where: { id: token.tenantId, status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      });

      if (!user || !tenant) return null;

      const claimed = await tx.setupToken.updateMany({
        where: {
          id: token.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) return null;

      const passwordHash = await bcrypt.hash(newPassword, 12);
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: false,
          tokenVersion: { increment: 1 },
        },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          tokenVersion: true,
          mustChangePassword: true,
        },
      });

      await tx.setupToken.updateMany({
        where: {
          userId: user.id,
          id: { not: token.id },
          usedAt: null,
        },
        data: { usedAt: now },
      });

      return updatedUser;
    });

    if (!result) {
      setupTokenError(res);
      return;
    }

    const token = jwt.sign(
      {
        userId: result.id,
        email: result.email,
        role: result.role,
        tenantId: result.tenantId,
        firstName: result.firstName,
        lastName: result.lastName,
        mustChangePassword: false,
        tokenVersion: result.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Password setup completed successfully.',
      token,
      user: result,
    });
  } catch (error) {
    console.error('Password setup error:', error);
    res.status(500).json({ success: false, message: 'Unable to set up password.' });
  }
};

export const getSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: 'User account not found or inactive.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve session.',
    });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, requestedRole } = req.body;
    if (!credential) {
      res.status(400).json({ success: false, message: 'Google credential token is required.' });
      return;
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId || undefined,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.trim().toLowerCase();
    if (!email || payload?.email_verified !== true) {
      res.status(401).json({ success: false, message: 'Unable to verify Google account.' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true, studentProfile: true, teacherProfile: true, parentProfile: true },
    });
    if (!user || !user.isActive) {
      res.status(403).json({ success: false, message: 'Google account is not registered. Please create an account first.' });
      return;
    }
    if (
      user.tenant &&
      (user.tenant.deletedAt !== null ||
        user.tenant.status === 'SUSPENDED' ||
        user.tenant.status === 'INACTIVE')
    ) {
      res.status(403).json({ success: false, message: 'Your organization is currently inactive or suspended.' });
      return;
    }
    if (requestedRole && user.role !== String(requestedRole).toUpperCase()) {
      res.status(403).json({ success: false, message: 'This account is not registered for the selected portal.' });
      return;
    }
    const token = jwt.sign({
      userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId,
      firstName: user.firstName, lastName: user.lastName,
      mustChangePassword: user.mustChangePassword, tokenVersion: user.tokenVersion,
    }, config.jwtSecret, { expiresIn: '7d' });
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        status: user.tenant.status,
        plan: user.tenant.plan,
      } : null,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile ? {
        id: user.teacherProfile.id,
        userId: user.teacherProfile.userId,
        employeeNo: user.teacherProfile.employeeNo,
        specialization: user.teacherProfile.specialization,
      } : null,
      parentProfile: user.parentProfile ? {
        id: user.parentProfile.id,
        phoneNumber: user.parentProfile.phoneNumber,
      } : null,
    };
    res.status(200).json({ success: true, message: 'Logged in successfully', token, user: safeUser });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { firstName: true, isActive: true },
  });
  if (user?.isActive) {
    const code = crypto.randomInt(100000, 1000000).toString();
    let challenge;
    try {
      challenge = await createOtpChallenge(email, 'PASSWORD_RESET', code);
    } catch (error) {
      if (error instanceof OtpLimitError) {
        res.status(429).json({ success: false, message: 'Too many reset requests. Try again later.' });
        return;
      }
      if (error instanceof OtpConfigurationError) {
        res.status(503).json({ success: false, message: 'Password reset is temporarily unavailable.' });
        return;
      }
      throw error;
    }
    const delivery = await sendPasswordResetEmail({ to: email, name: user.firstName, otp: code });
    if (!delivery.success) {
      await prisma.otpChallenge.updateMany({ where: { id: challenge.id, consumedAt: null }, data: { consumedAt: new Date() } });
      res.status(503).json({ success: false, message: 'Password reset delivery is temporarily unavailable.' });
      return;
    }
  }
  res.status(200).json({ success: true, message: 'If an account exists, a reset code has been generated.' });
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.otp || '').trim();
  let verification;
  try {
    verification = await verifyOtpChallenge(email, 'PASSWORD_RESET', code);
  } catch (error) {
    if (error instanceof OtpConfigurationError) {
      res.status(503).json({ success: false, message: 'Password reset is temporarily unavailable.' });
      return;
    }
    throw error;
  }
  if (!verification.valid) {
    res.status(400).json({ success: false, message: 'Reset code is invalid or expired.' });
    return;
  }
  res.status(200).json({ success: true, message: 'Reset code verified.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.otp || '').trim();
  const password = String(req.body?.newPassword || '');
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    res.status(400).json({ success: false, message: validation.message });
    return;
  }
  let verification;
  try {
    verification = await verifyOtpChallenge(email, 'PASSWORD_RESET', code);
  } catch (error) {
    if (error instanceof OtpConfigurationError) {
      res.status(503).json({ success: false, message: 'Password reset is temporarily unavailable.' });
      return;
    }
    throw error;
  }
  if (!verification.valid) {
    res.status(400).json({ success: false, message: 'Reset code is invalid or expired.' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const completed = await prisma.$transaction(async (tx) => {
    const claimed = await tx.otpChallenge.updateMany({
      where: {
        id: verification.challengeId,
        attempts: { equals: verification.attempts, lt: 5 },
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) return false;
    const user = await tx.user.findUnique({ where: { email }, select: { id: true, isActive: true } });
    if (!user?.isActive) return false;
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, tokenVersion: { increment: 1 }, mustChangePassword: false },
    });
    return true;
  });
  if (!completed) {
    res.status(400).json({ success: false, message: 'Reset code is invalid or expired.' });
    return;
  }
  res.status(200).json({ success: true, message: 'Password reset successfully.' });
};
