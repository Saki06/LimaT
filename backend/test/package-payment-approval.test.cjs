const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../dist/config/prisma');
const { verifyBankSlip } = require('../dist/controllers/package.controller');

const originalFindUnique = prisma.packageSubscription.findUnique;
const originalTransaction = prisma.$transaction;
let currentStatus;
let enrollments;

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const install = () => {
  currentStatus = 'PENDING';
  enrollments = 0;
  prisma.packageSubscription.findUnique = async () => ({
    id: 'subscription-a',
    status: currentStatus,
    studentId: 'student-a',
    endDate: new Date(Date.now() + 86400000),
    package: {
      id: 'package-a',
      tenantId: 'tenant-a',
      durationDays: 30,
      teacher: { userId: 'teacher-a' },
      courses: [{ courseId: 'course-a' }],
    },
    student: { user: { id: 'student-user-a', tenantId: 'tenant-a', firstName: 'A', lastName: 'Student' } },
  });
  prisma.$transaction = async (callback) => callback({
    packageSubscription: {
      updateMany: async ({ where, data }) => {
        if (currentStatus !== where.status) return { count: 0 };
        currentStatus = data.status;
        return { count: 1 };
      },
      findUnique: async () => ({ id: 'subscription-a', status: currentStatus }),
    },
    enrollment: { upsert: async () => { enrollments += 1; } },
  });
};

test.beforeEach(install);
test.after(() => {
  prisma.packageSubscription.findUnique = originalFindUnique;
  prisma.$transaction = originalTransaction;
});

const request = (user, body = { action: 'APPROVE' }) => ({
  user,
  params: { subscriptionId: 'subscription-a' },
  body,
});

test('unrelated teacher and cross-tenant admin cannot approve a slip', async () => {
  let res = response();
  await verifyBankSlip(request({ userId: 'other-teacher', role: 'TEACHER', tenantId: 'tenant-b' }), res);
  assert.equal(res.statusCode, 403);
  assert.equal(currentStatus, 'PENDING');

  res = response();
  await verifyBankSlip(request({ userId: 'admin-b', role: 'ADMIN', tenantId: 'tenant-b' }), res);
  assert.equal(res.statusCode, 403);
  assert.equal(currentStatus, 'PENDING');
});

test('package owner approval atomically activates and enrolls the student', async () => {
  const res = response();
  await verifyBankSlip(request({ userId: 'teacher-a', role: 'TEACHER', tenantId: 'tenant-a' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'ACTIVE');
  assert.equal(currentStatus, 'ACTIVE');
  assert.equal(enrollments, 1);
});

test('already reviewed subscriptions cannot be approved twice', async () => {
  currentStatus = 'ACTIVE';
  const res = response();
  await verifyBankSlip(request({ userId: 'teacher-a', role: 'TEACHER', tenantId: 'tenant-a' }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(enrollments, 0);
});
