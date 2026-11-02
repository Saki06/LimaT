
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

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
    ] as const;

    const data: Record<string, string | null> = {};

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
    console.error('Update Super Admin Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};
