
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Prisma } from '@prisma/client';

export const getSuperAdminProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        superAdminProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get Super Admin Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

export const updateSuperAdminProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const allowedFields = [
      'fullName',
      'preferredName',
      'phone',
      'altPhone',
      'address',
      'city',
      'district',
      'province',
      'postalCode',
      'bio',
      'gender',
      'languages',
      'rootAuthorityId',
    ] as const;

        const data: Record<string, string | Date | null> = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        const value = req.body[field];

        if (value !== null && typeof value !== 'string') {
          res.status(400).json({
            success: false,
            message: `Invalid value for ${field}`,
          });
          return;
        }

        if (typeof value === 'string' && value.length > 1000) {
          res.status(400).json({
            success: false,
            message: `${field} is too long`,
          });
          return;
        }

        data[field] = typeof value === 'string'
          ? value.trim()
          : null;
      }
    }

        // Validate date of birth separately because Prisma expects DateTime
    let dateOfBirth: Date | null | undefined;

    if (req.body?.dateOfBirth !== undefined) {
      const value = req.body.dateOfBirth;

      if (value === null || value === '') {
        dateOfBirth = null;
      } else if (typeof value === 'string') {
        const validFormat = /^\d{4}-\d{2}-\d{2}$/.test(value);
        const parsedDate = new Date(`${value}T00:00:00.000Z`);

        if (
          !validFormat ||
          Number.isNaN(parsedDate.getTime()) ||
          parsedDate.toISOString().slice(0, 10) !== value ||
          parsedDate.getTime() > Date.now()
        ) {
          res.status(400).json({
            success: false,
            message: 'Invalid dateOfBirth. Use YYYY-MM-DD format.',
          });
          return;
        }

        dateOfBirth = parsedDate;
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid value for dateOfBirth',
        });
        return;
      }
    }

    if (dateOfBirth !== undefined) {
            data.dateOfBirth = dateOfBirth;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid profile fields provided',
      });
      return;
    }

    const profile = await prisma.superAdminProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        message: 'Root Authority ID is already in use',
      });
      return;
    }

    console.error('Update Super Admin Profile Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};
