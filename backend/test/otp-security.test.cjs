const test = require('node:test');
const assert = require('node:assert/strict');
process.env.OTP_HMAC_SECRET ||= 'test-only-otp-hmac-secret-32-bytes-minimum';
const { prisma } = require('../dist/config/prisma');

const originalOtpDelegate = prisma.otpChallenge;
const rows = [];
let transactionTail = Promise.resolve();

const matches = (row, where = {}) => {
  if (where.id && row.id !== where.id) return false;
  if (where.email && row.email !== where.email) return false;
  if (where.purpose && row.purpose !== where.purpose) return false;
  if (where.consumedAt === null && row.consumedAt !== null) return false;
  if (where.attempts && typeof where.attempts === 'object') {
    if (where.attempts.equals !== undefined && row.attempts !== where.attempts.equals) return false;
    if (where.attempts.lt !== undefined && !(row.attempts < where.attempts.lt)) return false;
  }
  if (where.expiresAt?.gt && !(row.expiresAt > where.expiresAt.gt)) return false;
  if (where.createdAt?.gte && !(row.createdAt >= where.createdAt.gte)) return false;
  return true;
};

const fakeDelegate = {
  async count({ where }) { return rows.filter((row) => matches(row, where)).length; },
  async create({ data }) {
    const row = { id: `otp-${rows.length + 1}`, ...data, attempts: 0, consumedAt: null, createdAt: new Date() };
    rows.push(row);
    return row;
  },
  async findFirst({ where, orderBy }) {
    const found = rows.filter((row) => matches(row, where));
    if (orderBy?.createdAt === 'desc') found.sort((a, b) => b.createdAt - a.createdAt);
    return found[0] || null;
  },
  async updateMany({ where, data }) {
    let count = 0;
    for (const row of rows) {
      if (!matches(row, where)) continue;
      if (data.consumedAt !== undefined) row.consumedAt = data.consumedAt;
      if (data.attempts?.increment) row.attempts += data.attempts.increment;
      count += 1;
    }
    return { count };
  },
};

Object.defineProperty(prisma, 'otpChallenge', { configurable: true, value: fakeDelegate });
prisma.$transaction = async (callback) => {
  let release;
  const tx = {
    otpChallenge: fakeDelegate,
    $queryRaw: async () => {
      const previous = transactionTail;
      transactionTail = new Promise((resolve) => { release = resolve; });
      await previous;
      return [];
    },
  };
  try {
    return await callback(tx);
  } finally {
    release?.();
  }
};

test.after(() => {
  Object.defineProperty(prisma, 'otpChallenge', { configurable: true, value: originalOtpDelegate });
});

test('OTP attempts persist across service reloads and stop after five wrong codes', async () => {
  const servicePath = require.resolve('../dist/services/otp.service');
  let otp = require(servicePath);
  await otp.createOtpChallenge('user@example.com', 'PASSWORD_RESET', '123456');

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await otp.verifyOtpChallenge('user@example.com', 'PASSWORD_RESET', '000000');
    assert.equal(result.valid, false);
  }

  delete require.cache[servicePath];
  otp = require(servicePath);
  const locked = await otp.verifyOtpChallenge('user@example.com', 'PASSWORD_RESET', '123456');
  assert.deepEqual(locked, { valid: false, reason: 'attempts' });
  assert.equal(rows[0].attempts, 5);
});

test('OTP challenge expiration and one-time consumption are enforced', async () => {
  const otp = require('../dist/services/otp.service');
  const challenge = await otp.createOtpChallenge('second@example.com', 'PASSWORD_RESET', '654321');
  const verified = await otp.verifyOtpChallenge('second@example.com', 'PASSWORD_RESET', '654321');
  assert.equal(verified.valid, true);
  assert.equal(await otp.consumeOtpChallenge(challenge.id, 0), true);
  assert.equal(await otp.consumeOtpChallenge(challenge.id, 0), false);

  const expired = await otp.createOtpChallenge('third@example.com', 'PASSWORD_RESET', '111222');
  rows.find((row) => row.id === expired.id).expiresAt = new Date(0);
  assert.deepEqual(
    await otp.verifyOtpChallenge('third@example.com', 'PASSWORD_RESET', '111222'),
    { valid: false, reason: 'expired' },
  );
});

test('concurrent wrong OTP attempts atomically reach the persistent limit', async () => {
  const otp = require('../dist/services/otp.service');
  const challenge = await otp.createOtpChallenge('concurrent@example.com', 'PASSWORD_RESET', '246810');
  await Promise.all(Array.from({ length: 20 }, () =>
    otp.verifyOtpChallenge('concurrent@example.com', 'PASSWORD_RESET', '000000')
  ));
  assert.equal(rows.find((row) => row.id === challenge.id).attempts, 5);
  assert.deepEqual(
    await otp.verifyOtpChallenge('concurrent@example.com', 'PASSWORD_RESET', '246810'),
    { valid: false, reason: 'attempts' },
  );
});

test('OTP storage uses the configured keyed HMAC', async () => {
  const crypto = require('node:crypto');
  const otp = require('../dist/services/otp.service');
  const challenge = await otp.createOtpChallenge('hmac@example.com', 'PASSWORD_RESET', '135790');
  const expected = crypto.createHmac('sha256', process.env.OTP_HMAC_SECRET)
    .update(['hmac@example.com', 'PASSWORD_RESET', '135790'].join('\0'))
    .digest('hex');
  assert.equal(challenge.tokenHash, expected);
});

test('concurrent OTP issuance is serialized against the persistent hourly limit', async () => {
  const otp = require('../dist/services/otp.service');
  const results = await Promise.allSettled(Array.from({ length: 20 }, (_, index) =>
    otp.createOtpChallenge('issuance-limit@example.com', 'PASSWORD_RESET', String(100000 + index))
  ));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 5);
  assert.equal(results.filter((result) => result.status === 'rejected').length, 15);
  assert.equal(rows.filter((row) => row.email === 'issuance-limit@example.com').length, 5);
});
