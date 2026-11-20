const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../dist/config/prisma');
const student = require('../dist/controllers/student.controller');

const originals = {
  studentProfile: prisma.studentProfile.findUnique,
  packageFind: prisma.package.findFirst,
  subscriptionFind: prisma.packageSubscription.findFirst,
  subscriptionCreate: prisma.packageSubscription.create,
  subscriptionUpdate: prisma.packageSubscription.update,
};
const setMethod = (delegate, key, value) => Object.defineProperty(delegate, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
let created;

test.after(() => {
  setMethod(prisma.studentProfile, 'findUnique', originals.studentProfile);
  setMethod(prisma.package, 'findFirst', originals.packageFind);
  setMethod(prisma.packageSubscription, 'findFirst', originals.subscriptionFind);
  setMethod(prisma.packageSubscription, 'create', originals.subscriptionCreate);
  setMethod(prisma.packageSubscription, 'update', originals.subscriptionUpdate);
});

test('card and evidence-free subscription requests are rejected before database writes', async () => {
  let profileLookups = 0;
  setMethod(prisma.studentProfile, 'findUnique', async () => { profileLookups += 1; return null; });
  let res = response();
  await student.checkoutPackage({ user: { userId: 'student-a', role: 'STUDENT' }, params: { packageId: 'package-a' }, body: { paymentMethod: 'CARD' } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(profileLookups, 0);

  res = response();
  await student.subscribePackage({ user: { userId: 'student-a', role: 'STUDENT' }, params: { packageId: 'package-a' }, body: {} }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(profileLookups, 0);
});

test('student bank slip creates pending subscription without enrollment or activation', async () => {
  created = null;
  setMethod(prisma.studentProfile, 'findUnique', async () => ({
    id: 'student-profile-a', user: { tenantId: 'tenant-a' },
  }));
  setMethod(prisma.package, 'findFirst', async () => ({
    id: 'package-a', tenantId: 'tenant-a', title: 'Maths', price: 2000, durationDays: 30,
    teacherId: 'teacher-a', teacher: { websiteUrl: null, user: { firstName: 'T', lastName: 'A' } }, courses: [],
  }));
  setMethod(prisma.packageSubscription, 'findFirst', async () => null);
  setMethod(prisma.packageSubscription, 'create', async ({ data }) => {
    created = { id: 'subscription-a', ...data, createdAt: new Date(), endDate: data.endDate };
    return created;
  });
  const res = response();
  await student.checkoutPackage({
    user: { userId: 'student-a', role: 'STUDENT' },
    params: { packageId: 'package-a' },
    body: { paymentMethod: 'BANK_SLIP', bankRefNo: 'BANK-123', slipUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/BpoAAAAASUVORK5CYII=' },
  }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.status, 'pending');
  assert.equal(created.status, 'PENDING');
});

test('invalid, unsupported, content-mismatched, and oversized slips are rejected before database reads', async () => {
  let profileLookups = 0;
  setMethod(prisma.studentProfile, 'findUnique', async () => { profileLookups += 1; return null; });
  const slips = [
    { bankRefNo: 'AB', slipUrl: 'data:image/png;base64,iVBORw0KGgo=' },
    { bankRefNo: 'BANK-123', slipUrl: 'data:text/plain;base64,SGVsbG8=' },
    { bankRefNo: 'BANK-123', slipUrl: 'data:image/png;base64,SGVsbG8=' },
    { bankRefNo: 'BANK-123', slipUrl: `data:application/pdf;base64,${Buffer.alloc(1_000_001).toString('base64')}` },
  ];
  for (const slip of slips) {
    const res = response();
    await student.checkoutPackage({
      user: { userId: 'student-a', role: 'STUDENT' }, params: { packageId: 'package-a' },
      body: { paymentMethod: 'BANK_SLIP', ...slip },
    }, res);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(profileLookups, 0);
});

test('supported PDF slip content is accepted and remains pending', async () => {
  let created;
  setMethod(prisma.studentProfile, 'findUnique', async () => ({ id: 'student-profile-a', user: { tenantId: 'tenant-a' } }));
  setMethod(prisma.package, 'findFirst', async () => ({
    id: 'package-a', tenantId: 'tenant-a', title: 'Maths', price: 2000, durationDays: 30,
    teacherId: 'teacher-a', teacher: { websiteUrl: null, user: { firstName: 'T', lastName: 'A' } }, courses: [],
  }));
  setMethod(prisma.packageSubscription, 'findFirst', async () => null);
  setMethod(prisma.packageSubscription, 'create', async ({ data }) => {
    created = { id: 'subscription-pdf', ...data, createdAt: new Date() };
    return created;
  });
  const res = response();
  await student.checkoutPackage({
    user: { userId: 'student-a', role: 'STUDENT' }, params: { packageId: 'package-a' },
    body: { paymentMethod: 'BANK_SLIP', bankRefNo: 'BANK-456', slipUrl: 'data:application/pdf;base64,JVBERi0xLjQKJSVFT0YK' },
  }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.status, 'PENDING');
  assert.equal(res.body.data.status, 'pending');
});
