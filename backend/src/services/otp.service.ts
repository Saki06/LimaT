import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../config/prisma';

export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_REQUESTS_PER_HOUR = 5;
export const OTP_TTL_MS = 15 * 60_000;

export type OtpPurpose = 'PASSWORD_RESET' | 'PARENT_CHILD_LINK';

export class OtpConfigurationError extends Error {}

export const hashOtpToken = (scope: string, purpose: OtpPurpose, value: string): string => {
  if (config.otpHmacSecret.length < 32) {
    throw new OtpConfigurationError('OTP_HMAC_SECRET must be configured with at least 32 characters.');
  }
  return crypto.createHmac('sha256', config.otpHmacSecret)
    .update(`${scope}\0${purpose}\0${value}`)
    .digest('hex');
};

const equalHash = (expectedHex: string, email: string, purpose: OtpPurpose, candidate: string): boolean => {
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = Buffer.from(hashOtpToken(email, purpose, candidate), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

export class OtpLimitError extends Error {}

export const createOtpChallenge = async (email: string, purpose: OtpPurpose, code: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 60_000);
  return prisma.$transaction(async (tx) => {
    // Serialize per-email/purpose issuance so concurrent requests cannot all
    // pass the persistent hourly count check before any challenge is inserted.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${normalizedEmail}), hashtext(${purpose}))`;
    const recentRequests = await tx.otpChallenge.count({
      where: { email: normalizedEmail, purpose, createdAt: { gte: windowStart } },
    });
    if (recentRequests >= OTP_MAX_REQUESTS_PER_HOUR) throw new OtpLimitError('OTP request limit reached.');

    await tx.otpChallenge.updateMany({
      where: { email: normalizedEmail, purpose, consumedAt: null },
      data: { consumedAt: now },
    });
    return tx.otpChallenge.create({
      data: {
        email: normalizedEmail,
        purpose,
        tokenHash: hashOtpToken(normalizedEmail, purpose, code),
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      },
    });
  });
};

export type OtpVerification =
  | { valid: true; challengeId: string; attempts: number }
  | { valid: false; reason: 'missing' | 'expired' | 'attempts' | 'invalid' };

export const verifyOtpChallenge = async (
  email: string,
  purpose: OtpPurpose,
  code: string,
): Promise<OtpVerification> => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();
  const challenge = await prisma.otpChallenge.findFirst({
    where: { email: normalizedEmail, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!challenge) return { valid: false, reason: 'missing' };
  if (challenge.expiresAt <= now) return { valid: false, reason: 'expired' };
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) return { valid: false, reason: 'attempts' };
  if (!/^\d{6}$/.test(code) || !equalHash(challenge.tokenHash, normalizedEmail, purpose, code)) {
    const incremented = await prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        attempts: { lt: OTP_MAX_ATTEMPTS },
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { attempts: { increment: 1 } },
    });
    if (incremented.count !== 1) return { valid: false, reason: 'attempts' };
    const current = await prisma.otpChallenge.findFirst({ where: { id: challenge.id } });
    return { valid: false, reason: current && current.attempts >= OTP_MAX_ATTEMPTS ? 'attempts' : 'invalid' };
  }
  return { valid: true, challengeId: challenge.id, attempts: challenge.attempts };
};

export const consumeOtpChallenge = async (challengeId: string, attempts: number): Promise<boolean> => {
  const result = await prisma.otpChallenge.updateMany({
    where: {
      id: challengeId,
      attempts: { equals: attempts, lt: OTP_MAX_ATTEMPTS },
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  });
  return result.count === 1;
};
