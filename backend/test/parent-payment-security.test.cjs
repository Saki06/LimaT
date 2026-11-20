const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../dist/config/prisma');
const parent = require('../dist/controllers/parent.controller');
const packages = require('../dist/controllers/package.controller');

const originalDelegates = {
  parentProfile: prisma.parentProfile,
  studentProfile: prisma.studentProfile,
  package: prisma.package,
  packageSubscription: prisma.packageSubscription,
};

let createdSubscription;
let createCount;
let parentTenantId = 'tenant-a';
let studentTenantId = 'tenant-a';

const setDelegate = (key, value) => Object.defineProperty(prisma, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const installMocks = () => {
  createdSubscription = null;
  createCount = 0;
  parentTenantId = 'tenant-a';
  studentTenantId = 'tenant-a';
  setDelegate('parentProfile', { findUnique: async () => ({ id: 'parent-profile-a', user: { tenantId: parentTenantId } }) });
  setDelegate('studentProfile', {
    findFirst: async () => ({
      id: 'student-a',
      user: { tenantId: studentTenantId, firstName: 'Student', lastName: 'A' },
    }),
  });
  setDelegate('package', {
    findFirst: async () => ({ id: 'package-a', tenantId: 'tenant-a', title: 'Maths', price: 2000, durationDays: 30 }),
  });
  setDelegate('packageSubscription', {
    findFirst: async () => null,
    create: async ({ data }) => {
      createCount += 1;
      createdSubscription = { id: 'subscription-a', ...data, createdAt: new Date(), endDate: data.endDate };
      return createdSubscription;
    },
  });
};

test.beforeEach(installMocks);
test.after(() => {
  for (const [key, value] of Object.entries(originalDelegates)) setDelegate(key, value);
});

const validSlip = `data:image/png;base64,${Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/xioAAAAASUVORK5CYII=', 'base64').toString('base64')}`;
const request = (body) => ({
  user: { userId: 'parent-user-a', role: 'PARENT' },
  body: {
    childId: 'student-a', packageId: 'package-a', slipRefNumber: 'BANK-1234',
    bankName: 'Test Bank', branchName: 'Main', depositedDate: new Date().toISOString().slice(0, 10),
    amountLkr: 2000, slipImageUrl: validSlip, ...body,
  },
});

test('parent bank slip success creates only a pending subscription after file validation', async () => {
  const res = response();
  await parent.submitDepositSlip(request({}), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.subscription.status, 'PENDING');
  assert.equal(res.body.data.invoice.status, 'under_review');
  assert.equal(createdSubscription.status, 'PENDING');
  assert.equal(createdSubscription.slipUrl, validSlip);
  assert.equal(createCount, 1);
});

test('parent bank slip rejects missing package and malformed file without writing', async () => {
  let res = response();
  await parent.submitDepositSlip(request({ packageId: undefined }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(createCount, 0);

  res = response();
  await parent.submitDepositSlip(request({ slipImageUrl: '/images/mock_slips/sample_slip.jpg' }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(createCount, 0);
});

test('parent bank slip rejects cross-tenant child links', async () => {
  parentTenantId = 'tenant-a';
  studentTenantId = 'tenant-b';
  const res = response();
  await parent.submitDepositSlip(request({}), res);
  assert.equal(res.statusCode, 403);
  assert.equal(createCount, 0);
});

test('legacy package subscribe endpoint cannot fabricate payment or activate access', async () => {
  const res = response();
  await packages.subscribeToPackage({ user: { userId: 'student-a', role: 'STUDENT' }, params: { id: 'package-a' } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.success, false);
  assert.equal(createCount, 0);
});
