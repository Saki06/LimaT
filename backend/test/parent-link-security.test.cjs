const test = require('node:test');
const assert = require('node:assert/strict');
process.env.OTP_HMAC_SECRET ||= 'test-only-otp-hmac-secret-32-bytes-minimum';
const { prisma } = require('../dist/config/prisma');
const parent = require('../dist/controllers/parent.controller');

const originalParent = prisma.parentProfile.findUnique;
const originalStudent = prisma.studentProfile.findFirst;
const originalLink = prisma.parentChildLinkRequest;
const setMethod = (delegate, key, value) => Object.defineProperty(delegate, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test.after(() => {
  setMethod(prisma.parentProfile, 'findUnique', originalParent);
  setMethod(prisma.studentProfile, 'findFirst', originalStudent);
  Object.defineProperty(prisma, 'parentChildLinkRequest', { configurable: true, value: originalLink });
});

test('non-parent cannot start or confirm a child link', async () => {
  let res = response();
  await parent.linkChildStudent({ user: { userId: 'user-a', role: 'STUDENT' }, body: { studentIdentifier: 'STU-1' } }, res);
  assert.equal(res.statusCode, 403);

  res = response();
  await parent.confirmChildLink({ user: { userId: 'user-a', role: 'STUDENT' }, body: { requestId: 'req-a', otp: '123456' } }, res);
  assert.equal(res.statusCode, 403);
});

test('link lookup rejects a student returned from another tenant', async () => {
  setMethod(prisma.parentProfile, 'findUnique', async () => ({
    id: 'parent-profile-a',
    user: { id: 'parent-a', role: 'PARENT', tenantId: 'tenant-a' },
    students: [],
  }));
  setMethod(prisma.studentProfile, 'findFirst', async () => ({
    id: 'student-b', guardianId: null,
    user: { firstName: 'Student', lastName: 'B', email: 'student@example.com', tenantId: 'tenant-b' },
  }));
  const res = response();
  await parent.linkChildStudent({ user: { userId: 'parent-a', role: 'PARENT' }, body: { studentIdentifier: 'student@example.com' } }, res);
  assert.equal(res.statusCode, 403);
});

test('wrong parent-link code increments the durable request attempt counter', async () => {
  let attempts = 0;
  setMethod(prisma.parentProfile, 'findUnique', async () => ({
    id: 'parent-profile-a',
    user: { id: 'parent-a', role: 'PARENT', tenantId: 'tenant-a' },
    students: [],
  }));
  const delegate = {
    findFirst: async () => ({
      id: 'request-a', parentId: 'parent-profile-a', studentId: 'student-a',
      tokenHash: require('../dist/services/otp.service').hashOtpToken('request-a', 'PARENT_CHILD_LINK', '123456'),
      attempts, expiresAt: new Date(Date.now() + 60000), consumedAt: null,
      student: { id: 'student-a', guardianId: null, user: { tenantId: 'tenant-a', role: 'STUDENT', isActive: true } },
      parent: { user: { tenantId: 'tenant-a' } },
    }),
    updateMany: async ({ where, data }) => {
      if (where.attempts?.lt !== undefined && attempts >= where.attempts.lt) return { count: 0 };
      if (where.attempts !== undefined && typeof where.attempts !== 'object' && where.attempts !== attempts) return { count: 0 };
      attempts += data.attempts.increment;
      return { count: 1 };
    },
  };
  Object.defineProperty(prisma, 'parentChildLinkRequest', { configurable: true, value: delegate });
  const res = response();
  await parent.confirmChildLink({ user: { userId: 'parent-a', role: 'PARENT' }, body: { requestId: 'request-a', otp: '000000' } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(attempts, 1);
});

test('parallel wrong parent-link OTP submissions cannot exceed or bypass the attempt limit', async () => {
  let attempts = 0;
  setMethod(prisma.parentProfile, 'findUnique', async () => ({
    id: 'parent-profile-a', user: { id: 'parent-a', role: 'PARENT', tenantId: 'tenant-a' }, students: [],
  }));
  const delegate = {
    findFirst: async () => attempts >= 5 ? null : ({
      id: 'request-concurrent', parentId: 'parent-profile-a', studentId: 'student-a',
      tokenHash: require('../dist/services/otp.service').hashOtpToken('request-concurrent', 'PARENT_CHILD_LINK', '123456'),
      attempts, expiresAt: new Date(Date.now() + 60000), consumedAt: null,
      student: { id: 'student-a', guardianId: null, user: { tenantId: 'tenant-a', role: 'STUDENT', isActive: true } },
      parent: { user: { tenantId: 'tenant-a' } },
    }),
    updateMany: async ({ where, data }) => {
      if (attempts >= where.attempts.lt) return { count: 0 };
      attempts += data.attempts.increment;
      return { count: 1 };
    },
  };
  Object.defineProperty(prisma, 'parentChildLinkRequest', { configurable: true, value: delegate });
  const results = await Promise.all(Array.from({ length: 20 }, async () => {
    const res = response();
    await parent.confirmChildLink({ user: { userId: 'parent-a', role: 'PARENT' }, body: { requestId: 'request-concurrent', otp: '000000' } }, res);
    return res.statusCode;
  }));
  assert.equal(attempts, 5);
  assert.ok(results.every((status) => status === 400));
});
