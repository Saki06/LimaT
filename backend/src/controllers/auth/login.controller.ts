import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { Role } from '@prisma/client';
import { signUserToken, validateTenantStatus } from './auth.utils';

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
    if (user.tenantId && user.role !== Role.SUPER_ADMIN) {
      const tenantCheck = await validateTenantStatus(user.tenantId);
      if (!tenantCheck.valid) {
        res.status(403).json({
          success: false,
          message: tenantCheck.message || 'Your organization is currently inactive or suspended.',
        });
        return;
      }
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

