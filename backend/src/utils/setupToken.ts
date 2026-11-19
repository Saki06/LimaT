import { randomBytes, createHash } from 'crypto';

const SETUP_TOKEN_BYTES = 32;

export const generateSetupToken = (): string =>
  randomBytes(SETUP_TOKEN_BYTES).toString('base64url');

export const hashSetupToken = (token: string): string => {
  if (typeof token !== 'string' || token.length === 0) {
    throw new TypeError('Setup token must be a non-empty string.');
  }

  return createHash('sha256').update(token, 'utf8').digest('hex');
};
