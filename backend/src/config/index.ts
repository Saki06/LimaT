import dotenv from 'dotenv';
import path from 'path';

// Priority loading: if NODE_ENV is test or TEST_MODE is active, load .env.test
const envFile = process.env.ENV_FILE || (process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../.env.test') : path.resolve(__dirname, '../../.env'));
dotenv.config({ path: envFile });

const INSECURE_JWT_SECRETS = new Set([
  'fallback_secret_change_in_production',
  'secret',
  'changeme',
  'jwt_secret',
  'default',
  'your_jwt_secret',
  'lms_enterprise_jwt_secret_key_change_in_production',
  'newtoz_local_test_jwt_secret_key_2026',
]);

export function resolveJwtSecret(
  rawSecret: string | undefined,
  nodeEnv: string = process.env.NODE_ENV || 'development'
): string {
  const trimmed = typeof rawSecret === 'string' ? rawSecret.trim() : '';
  if (!trimmed) {
    throw new Error('FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is required and cannot be empty.');
  }

  if (nodeEnv === 'production') {
    if (trimmed.length < 32) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: JWT_SECRET in production must be a cryptographically strong secret of at least 32 characters.'
      );
    }
    if (
      INSECURE_JWT_SECRETS.has(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes('change_in_production') ||
      trimmed.toLowerCase().includes('test_jwt') ||
      trimmed.toLowerCase().includes('secret_key')
    ) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: Default, template, or test JWT_SECRET values are strictly prohibited in production mode. ' +
        'Please generate a cryptographically strong, random 32+ character secret.'
      );
    }
  } else {
    // Development & test environments: require non-default secret >= 16 chars
    const baseInsecure = new Set([
      'fallback_secret_change_in_production',
      'secret',
      'changeme',
      'jwt_secret',
      'default',
      'your_jwt_secret',
    ]);
    if (baseInsecure.has(trimmed.toLowerCase()) || trimmed.length < 16) {
      throw new Error('FATAL CONFIGURATION ERROR: JWT_SECRET must be a non-default secret of at least 16 characters.');
    }
  }

  return trimmed;
}

export function resolveFrontendUrl(rawUrl: string | undefined, nodeEnv: string): string {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (nodeEnv === 'production') {
    if (!trimmed) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: FRONTEND_URL environment variable is required in production.'
      );
    }
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: FRONTEND_URL cannot point to localhost in production mode. ' +
        'Please configure your production frontend domain (e.g., https://app.newtoz.com).'
      );
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        console.warn(
          `⚠️ [PRODUCTION WARNING] FRONTEND_URL (${trimmed}) is not using HTTPS. HTTPS is strongly recommended for production.`
        );
      }
    } catch {
      throw new Error(`FATAL CONFIGURATION ERROR: FRONTEND_URL (${trimmed}) is not a valid URL.`);
    }
    return trimmed;
  }
  return trimmed || 'http://localhost:3000';
}

export function validateEmailConfig(nodeEnv: string): void {
  if (nodeEnv === 'production') {
    if (process.env.MOCK_EMAIL === 'true') {
      throw new Error(
        'FATAL CONFIGURATION ERROR: MOCK_EMAIL cannot be enabled in production environment (NODE_ENV=production). ' +
        'Outbound email delivery would be silently suppressed.'
      );
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        '⚠️ [PRODUCTION CONFIGURATION WARNING] SMTP email credentials are not fully configured. ' +
        'Password resets, notices, and transactional emails will fail unless SMTP_HOST, SMTP_USER, and SMTP_PASS are set.'
      );
    }
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';
validateEmailConfig(nodeEnv);

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv,
  frontendUrl: resolveFrontendUrl(process.env.FRONTEND_URL, nodeEnv),
  jwtSecret: resolveJwtSecret(process.env.JWT_SECRET, nodeEnv),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '786252089709-nac7u469ercpt25hqjg1jkavga6d70hp.apps.googleusercontent.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || (process.env.SMTP_USER ? `"Newtoz LMS" <${process.env.SMTP_USER}>` : '"Newtoz LMS Support" <no-reply@newtoz.com>'),
  },
};
