import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { Role } from '@prisma/client';

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

    // Validate tenant status before issuing a JWT
if (user.tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { status: true },
  });

  if (
    !tenant ||
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
    const { firstName, lastName, email, password, gradeLevel, studentIdNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required student registration fields' });
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
      const defaultTenant = await prisma.tenant.findFirst();
      selectedTenantId = defaultTenant?.id;
    }

    if (!selectedTenantId) {
      res.status(400).json({ success: false, message: 'No valid tenant found to register student' });
      return;
    }

    const selectedTenant = await prisma.tenant.findUnique({
  where: { id: selectedTenantId },
  select: { status: true },
});

if (
  !selectedTenant ||
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
    const { firstName, lastName, email, password, specialization, employeeNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required tutor fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    let selectedTenantId = tenantId;
    if (!selectedTenantId) {
      const defaultTenant = await prisma.tenant.findFirst();
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
  select: { status: true },
});

if (
  !selectedTenant ||
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    let selectedTenantId = tenantId;
    if (!selectedTenantId) {
      const defaultTenant = await prisma.tenant.findFirst();
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
  select: { status: true },
});

if (
  !selectedTenant ||
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
