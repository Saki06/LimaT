const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('../dist/config/prisma');

const originalCount = prisma.package.count;
const originalFindMany = prisma.package.findMany;
const originalFindFirst = prisma.package.findFirst;
const privatePackage = {
  id: 'package-a',
  tenantId: 'tenant-a',
  title: 'Maths',
  isPublished: true,
  teacher: {
    id: 'teacher-a',
    userId: 'user-a',
    title: 'Teacher',
    specialization: 'Maths',
    bankName: 'Private Bank',
    bankAccountName: 'Private Name',
    bankAccountNumber: 'PRIVATE-123',
    bankBranch: 'Private Branch',
    bankBranchCode: 'PRIVATE-CODE',
    bankAccounts: [{ bankAccountNumber: 'PRIVATE-ARRAY' }],
    user: { id: 'user-a', firstName: 'Teacher', lastName: 'One', avatarUrl: null },
  },
  courses: [],
  _count: { subscriptions: 0 },
};

const appRequest = async (url) => {
  const app = express();
  app.use('/api/packages', require('../dist/routes/package.routes').default);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${url}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test.after(() => {
  Object.defineProperty(prisma.package, 'count', { configurable: true, value: originalCount });
  Object.defineProperty(prisma.package, 'findMany', { configurable: true, value: originalFindMany });
  Object.defineProperty(prisma.package, 'findFirst', { configurable: true, value: originalFindFirst });
});

test('unauthenticated public package list and detail responses omit every teacher payout field', async () => {
  prisma.package.count = async () => 1;
  prisma.package.findMany = async () => [privatePackage];
  prisma.package.findFirst = async () => privatePackage;

  for (const path of ['/api/packages', '/api/packages/package-a']) {
    const response = await appRequest(path);
    assert.equal(response.status, 200);
    const body = await response.text();
    for (const privateValue of ['Private Bank', 'Private Name', 'PRIVATE-123', 'Private Branch', 'PRIVATE-CODE', 'PRIVATE-ARRAY']) {
      assert.equal(body.includes(privateValue), false, `${path} exposed ${privateValue}`);
    }
    for (const privateField of ['bankName', 'bankAccountName', 'bankAccountNumber', 'bankBranch', 'bankBranchCode', 'bankAccounts']) {
      assert.equal(body.includes(privateField), false, `${path} exposed ${privateField}`);
    }
  }

  const paymentDetails = await appRequest('/api/packages/package-a/payment-details');
  assert.equal(paymentDetails.status, 401);
  assert.equal((await paymentDetails.text()).includes('PRIVATE-123'), false);
});

test('authorized package payment details are tenant-bound and return only payment fields', async () => {
  const { getPackagePaymentDetails } = require('../dist/controllers/package.controller');
  let query;
  prisma.package.findFirst = async (args) => { query = args; return { id: 'package-a', teacher: privatePackage.teacher }; };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await getPackagePaymentDetails({ user: { userId: 'student-a', role: 'STUDENT', tenantId: 'tenant-a' }, params: { id: 'package-a' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(query.where, { id: 'package-a', tenantId: 'tenant-a', isPublished: true });
  assert.deepEqual(res.body.data, {
    bankName: 'Private Bank',
    accountName: 'Private Name',
    accountNumber: 'PRIVATE-123',
    branch: 'Private Branch',
  });
  assert.equal(JSON.stringify(res.body).includes('bankAccounts'), false);
});
