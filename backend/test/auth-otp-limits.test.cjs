const test = require('node:test');
const assert = require('node:assert/strict');
process.env.OTP_HMAC_SECRET ||= 'test-only-otp-hmac-secret-32-bytes-minimum';
const { prisma } = require('../dist/config/prisma');
const auth = require('../dist/controllers/auth.controller');

const originalOtpDelegate = prisma.otpChallenge;
const originalUserDelegate = prisma.user;
let row;
let userUpdate;

const setDelegate = (key, value) => Object.defineProperty(prisma, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const installMocks = () => {
  row = {
    id: 'otp-reset-a',
    email: 'reset@example.com',
    purpose: 'PASSWORD_RESET',
    tokenHash: require('crypto').createHmac('sha256', process.env.OTP_HMAC_SECRET).update(['reset@example.com', 'PASSWORD_RESET', '123456'].join('\0')).digest('hex'),
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
    consumedAt: null,
    createdAt: new Date(),
  };
  userUpdate = null;
  setDelegate('otpChallenge', {
    findFirst: async ({ where }) => row.email === where.email && row.purpose === where.purpose && row.consumedAt === null ? row : null,
    updateMany: async ({ where, data }) => {
      if (row.id !== where.id || row.consumedAt !== null || row.expiresAt <= (where.expiresAt?.gt || new Date(0))) return { count: 0 };
      const attempts = where.attempts;
      if (attempts?.equals !== undefined && row.attempts !== attempts.equals) return { count: 0 };
      if (attempts?.lt !== undefined && row.attempts >= attempts.lt) return { count: 0 };
      if (data.attempts?.increment) row.attempts += data.attempts.increment;
      if (data.consumedAt) row.consumedAt = data.consumedAt;
      return { count: 1 };
    },
  });
  setDelegate('user', {
    findUnique: async () => ({ id: 'user-reset-a', isActive: true }),
    update: async (args) => { userUpdate = args; return { id: 'user-reset-a' }; },
  });
};

test.beforeEach(installMocks);
test.after(() => {
  setDelegate('otpChallenge', originalOtpDelegate);
  setDelegate('user', originalUserDelegate);
});

test('verify and reset endpoints share a persistent five-attempt limit', async () => {
  for (let index = 0; index < 4; index += 1) {
    const res = response();
    await auth.verifyResetCode({ body: { email: row.email, otp: '000000' } }, res);
    assert.equal(res.statusCode, 400);
  }
  const resetRes = response();
  await auth.resetPassword({ body: { email: row.email, otp: '000000', newPassword: 'ValidPassword9!' } }, resetRes);
  assert.equal(resetRes.statusCode, 400);
  assert.equal(row.attempts, 5);

  const verifyRes = response();
  await auth.verifyResetCode({ body: { email: row.email, otp: '123456' } }, verifyRes);
  assert.equal(verifyRes.statusCode, 400);
});

test('reset consumes a correct challenge and invalidates prior sessions', async () => {
  prisma.$transaction = async (callback) => callback({
    otpChallenge: prisma.otpChallenge,
    user: prisma.user,
  });
  const res = response();
  await auth.resetPassword({
    body: { email: row.email, otp: '123456', newPassword: 'ValidPassword9!' },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(row.consumedAt instanceof Date);
  assert.equal(userUpdate.where.id, 'user-reset-a');
  assert.equal(userUpdate.data.tokenVersion.increment, 1);
  assert.equal(userUpdate.data.mustChangePassword, false);
});
