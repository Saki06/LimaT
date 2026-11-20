import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { config } from '../../config';
import { Role } from '@prisma/client';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(String(email).trim().toLowerCase());
};

/**
 * Two-tier revoked token registry (VULN-10 remediation):
 *   1. Authoritative persistent PostgreSQL `RevokedToken` table (SHA-256 digests only).
 *   2. Process-local `Map` used strictly as a fast-reject cache for already-known
 *      revoked tokens — never used to assume a token is valid.
 */
const revokedTokenDigests = new Map<string, number>();

export const hashToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

export const revokeToken = async (rawToken: string): Promise<void> => {
  if (!rawToken) return;
  const decoded = jwt.decode(rawToken) as { exp?: number } | null;
  const expiresAtMs =
    decoded?.exp && Number.isFinite(decoded.exp)
      ? decoded.exp * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000;
  const digest = hashToken(rawToken);
  const expiresAt = new Date(expiresAtMs);

  // Persist to PostgreSQL before reporting success (throws on DB failure)
  await prisma.revokedToken.upsert({
    where: { tokenDigest: digest },
    create: { tokenDigest: digest, expiresAt },
    update: { expiresAt },
  });

  revokedTokenDigests.set(digest, expiresAtMs);

  // Opportunistic non-blocking cleanup of already-expired revocation rows
  prisma.revokedToken
    .deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    .catch(() => {
      // Non-critical background cleanup; never fails logout
    });
};

export const isTokenRevoked = async (rawToken: string): Promise<boolean> => {
  if (!rawToken) return false;
  const digest = hashToken(rawToken);

  // Fast-reject only if this process already observed the revocation
  const cachedExpMs = revokedTokenDigests.get(digest);
  if (cachedExpMs !== undefined) {
    if (Date.now() <= cachedExpMs) {
      return true;
    }
    revokedTokenDigests.delete(digest);
  }

  // Always verify against persistent PostgreSQL store; DB errors propagate to fail closed
  const record = await prisma.revokedToken.findUnique({
    where: { tokenDigest: digest },
    select: { expiresAt: true },
  });

  if (!record) return false;

  const expMs = record.expiresAt.getTime();
  if (Date.now() > expMs) {
    return false;
  }

  revokedTokenDigests.set(digest, expMs);
  return true;
};

/**
 * Signs a JWT token with standard LMS user payload and unique jti
 */
export const signUserToken = (payload: {
  userId: string;
  email: string;
  role: Role | string;
  tenantId: string | null;
  firstName?: string;
  lastName?: string;
}): string => {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
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

