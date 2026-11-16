import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { Role } from '@prisma/client';
import {
  isValidEmail,
  signUserToken,
  sanitizeUser,
  validateTenantStatus,
  generateUniqueStudentId,
} from './auth.utils';

export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, gradeLevel, section, studentIdNo, tenantId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required student registration fields' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
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

    // Default to first active tenant if none specified
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

    const tenantCheck = await validateTenantStatus(selectedTenantId);
    if (!tenantCheck.valid) {
      res.status(403).json({
        success: false,
        message: tenantCheck.message || 'Registration is unavailable for this organization.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let generatedStudentIdNo = typeof studentIdNo === 'string' && studentIdNo.trim()
      ? studentIdNo.trim()
      : await generateUniqueStudentId();

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
      include: {
        tenant: true,
        studentProfile: true,
      },
    });

    const token = signUserToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: sanitizeUser(newUser),
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
    if (!isValidEmail(normalizedEmail)) {
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

      const tenantCheck = await validateTenantStatus(selectedTenantId, tx);
      if (!tenantCheck.valid) {
        const err: any = new Error(tenantCheck.message || 'Registration is unavailable for this organization.');
        err.statusCode = 403;
        throw err;
      }

      const generatedEmployeeNo = employeeNo || 'FAC-' + Math.floor(1000 + Math.random() * 9000);

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
              employeeNo: generatedEmployeeNo,
            },
          },
        },
        include: {
          tenant: true,
          teacherProfile: true,
        },
      });
    });

    const token = signUserToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Tutor registered successfully',
      token,
      user: sanitizeUser(newUser),
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
    if (!isValidEmail(normalizedEmail)) {
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

    const tenantCheck = await validateTenantStatus(selectedTenantId);
    if (!tenantCheck.valid) {
      res.status(403).json({
        success: false,
        message: tenantCheck.message || 'Registration is unavailable for this organization.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic transaction for parent registration and optional child student link
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
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
        include: {
          tenant: true,
          parentProfile: true,
        },
      });

      if (user.parentProfile && typeof childStudentId === 'string' && childStudentId.trim()) {
        const cleanRef = childStudentId.trim();
        const digitsOnly = cleanRef.replace(/\D/g, '');
        const matchedStudent = await tx.studentProfile.findFirst({
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
          await tx.studentProfile.update({
            where: { id: matchedStudent.id },
            data: { guardianId: user.parentProfile.id },
          });
        }
      }

      return user;
    });

    const token = signUserToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    console.error('Register parent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

