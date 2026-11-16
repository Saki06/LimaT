import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { config } from '../../config';
import { Role } from '@prisma/client';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(String(email).trim().toLowerCase());
};

/**
 * Signs a JWT token with standard LMS user payload
 */
export const signUserToken = (payload: {
  userId: string;
  email: string;
  role: Role | string;
  tenantId: string | null;
  firstName?: string;
  lastName?: string;
}): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

/**
 * Strips passwordHash and returns a clean, safe user object
 */
export const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Validates whether a tenant is active and usable for registration/login
 */
export const validateTenantStatus = async (
  tenantId: string,
  txClient: any = prisma
): Promise<{ valid: boolean; message?: string; tenant?: any }> => {
  const tenant = await txClient.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!tenant || tenant.deletedAt !== null || tenant.status === 'SUSPENDED' || tenant.status === 'INACTIVE') {
    return {
      valid: false,
      message: 'Your organization is currently inactive, suspended, or not found.',
    };
  }

  return { valid: true, tenant };
};

/**
 * Generates a collision-safe Student ID (e.g. STU-4912)
 */
export const generateUniqueStudentId = async (txClient: any = prisma): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await txClient.studentProfile.findUnique({
      where: { studentIdNo: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  return `STU-${Date.now().toString().slice(-6)}`;
};

/**
 * Generates a collision-safe Teacher / Tutor Employee No (e.g. TUT-3814)
 */
export const generateUniqueEmployeeNo = async (
  prefix: string = 'TUT',
  txClient: any = prisma
): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await txClient.teacherProfile.findUnique({
      where: { employeeNo: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

