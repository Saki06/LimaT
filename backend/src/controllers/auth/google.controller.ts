import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/prisma';
import { config } from '../../config';
import { Role } from '@prisma/client';
import {
  signUserToken,
  sanitizeUser,
  validateTenantStatus,
  generateUniqueStudentId,
  generateUniqueEmployeeNo,
} from './auth.utils';

const googleClient = new OAuth2Client(config.googleClientId);

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

      const token = signUserToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
      });

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

    // New Google Registration
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

    // Resolve and validate tenantId
    let selectedTenantId = tenantId;
    if (!selectedTenantId && targetRole !== 'TEACHER') {
      const defaultTenant = await prisma.tenant.findFirst({
        where: { deletedAt: null, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });
      selectedTenantId = defaultTenant?.id || null;
    }

    if (selectedTenantId) {
      const tenantCheck = await validateTenantStatus(selectedTenantId);
      if (!tenantCheck.valid) {
        res.status(403).json({
          success: false,
          message: tenantCheck.message || 'Registration is unavailable for this organization.',
        });
        return;
      }
    } else if (targetRole !== 'TEACHER') {
      res.status(400).json({
        success: false,
        message: 'No valid active organization found for registration.',
      });
      return;
    }

    const randomPassword = `G_${Math.random().toString(36).slice(-10)}_${Date.now()}`;
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    if (targetRole === 'TEACHER') {
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

        const generatedEmployeeNo = await generateUniqueEmployeeNo('TUT', tx);

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
      // Default: STUDENT with collision-safe studentIdNo
      const studentIdNo = await generateUniqueStudentId();

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

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.status(201).json({
      success: true,
      message: 'Account created with Google successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during Google Authentication' });
  }
};

