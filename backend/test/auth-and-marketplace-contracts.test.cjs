const test = require('node:test');
const assert = require('node:assert/strict');
const { OAuth2Client } = require('google-auth-library');
const { prisma } = require('../dist/config/prisma');
const originalFindUser = prisma.user.findUnique;
const originalFindTenant = prisma.tenant.findFirst;
const originalTenantLookup = prisma.tenant.findUnique;
const originalCreateUser = prisma.user.create;
const originalMarketplaceQuery = prisma.teacherProfile.findMany;
const originalGoogleVerify = OAuth2Client.prototype.verifyIdToken;

const setMethod = (delegate, key, value) => Object.defineProperty(delegate, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test.after(() => {
  setMethod(prisma.user, 'findUnique', originalFindUser);
  setMethod(prisma.tenant, 'findFirst', originalFindTenant);
  setMethod(prisma.tenant, 'findUnique', originalTenantLookup);
  setMethod(prisma.user, 'create', originalCreateUser);
  setMethod(prisma.teacherProfile, 'findMany', originalMarketplaceQuery);
  setMethod(OAuth2Client.prototype, 'verifyIdToken', originalGoogleVerify);
});

test('Google login response excludes passwordHash and teacher payout fields', async () => {
  const auth = require('../dist/controllers/auth.controller');
  OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => ({ email: 'teacher@example.com', email_verified: true }) });
  setMethod(prisma.user, 'findUnique', async () => ({
    id: 'teacher-user-a', email: 'teacher@example.com', passwordHash: 'secret-hash', role: 'TEACHER',
    tenantId: 'tenant-a', firstName: 'T', lastName: 'One', avatarUrl: null, isActive: true,
    mustChangePassword: false, tokenVersion: 1,
    tenant: { id: 'tenant-a', name: 'A', status: 'ACTIVE', plan: 'PRO', deletedAt: null },
    studentProfile: null,
    teacherProfile: { id: 'teacher-a', userId: 'teacher-user-a', employeeNo: 'EMP-1', specialization: 'Maths', bankAccountNumber: 'PRIVATE' },
    parentProfile: null,
  }));
  const res = response();
  await auth.googleAuth({ body: { credential: 'google-token', requestedRole: 'TEACHER' } }, res);
  assert.equal(res.statusCode, 200);
  const output = JSON.stringify(res.body);
  assert.equal(output.includes('secret-hash'), false);
  assert.equal(output.includes('bankAccountNumber'), false);
  assert.equal(output.includes('PRIVATE'), false);
});

test('Google login rejects an unverified email before loading an account', async () => {
  const auth = require('../dist/controllers/auth.controller');
  let userLookups = 0;
  OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => ({ email: 'teacher@example.com', email_verified: false }) });
  setMethod(prisma.user, 'findUnique', async () => { userLookups += 1; return null; });
  const res = response();
  await auth.googleAuth({ body: { credential: 'google-token', requestedRole: 'TEACHER' } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(userLookups, 0);
  assert.equal(res.body.token, undefined);
});

test('Google login rejects a missing verified-email claim', async () => {
  const auth = require('../dist/controllers/auth.controller');
  let userLookups = 0;
  OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => ({ email: 'teacher@example.com' }) });
  setMethod(prisma.user, 'findUnique', async () => { userLookups += 1; return null; });
  const res = response();
  await auth.googleAuth({ body: { credential: 'google-token' } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(userLookups, 0);
});

test('student registration persists all requested profile fields separately', async () => {
  const auth = require('../dist/controllers/auth.controller');
  let createArgs;
  setMethod(prisma.user, 'findUnique', async () => null);
  setMethod(prisma.tenant, 'findFirst', async () => ({ id: 'tenant-a' }));
  setMethod(prisma.tenant, 'findUnique', async () => ({ status: 'ACTIVE', deletedAt: null }));
  setMethod(prisma.user, 'create', async (args) => {
    createArgs = args;
    return {
      id: 'student-user-a', email: args.data.email, role: 'STUDENT', tenantId: 'tenant-a', tokenVersion: 0,
      firstName: args.data.firstName, lastName: args.data.lastName, isActive: true, mustChangePassword: false,
      studentProfile: { id: 'student-a', studentIdNo: 'STU-1', gradeLevel: args.data.studentProfile.create.gradeLevel, section: args.data.studentProfile.create.section },
    };
  });
  const res = response();
  await auth.registerStudent({ body: {
    firstName: 'Student', lastName: 'One', email: 'student@example.com', password: 'ValidPassword9!',
    gradeLevel: 'Grade 12', section: '12B', phoneNumber: '+94112223333', gender: 'Female',
    medium: 'Tamil', district: 'Jaffna', stream: 'Biological Science',
  } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual({
    section: createArgs.data.studentProfile.create.section,
    phoneNumber: createArgs.data.studentProfile.create.phoneNumber,
    gender: createArgs.data.studentProfile.create.gender,
    medium: createArgs.data.studentProfile.create.medium,
    district: createArgs.data.studentProfile.create.district,
    stream: createArgs.data.studentProfile.create.stream,
  }, {
    section: '12B', phoneNumber: '+94112223333', gender: 'Female', medium: 'Tamil',
    district: 'Jaffna', stream: 'Biological Science',
  });
});

test('public teacher marketplace response omits private payout fields', async () => {
  const teacher = require('../dist/controllers/teacher.controller');
  setMethod(prisma.teacherProfile, 'findMany', async () => [{
    id: 'teacher-a', userId: 'teacher-user-a', specialization: 'Maths', title: 'Teacher', bio: '', rating: 4.8,
    isVerified: true, mediums: ['Tamil'], experienceYears: 5, city: '', district: '', coverImageUrl: null,
    publicSlug: 'teacher-a', youtubeUrl: null, whatsappNumber: null, qualifications: [], bankAccountNumber: 'PRIVATE',
    packages: [], courses: [], _count: { packages: 0, courses: 0, liveClasses: 0, libraryResources: 0 },
    user: { firstName: 'T', lastName: 'One', email: 'teacher@example.com', avatarUrl: null },
  }]);
  const res = response();
  await teacher.getTutorsMarketplace({ query: {} }, res);
  assert.equal(res.statusCode, 200);
  const output = JSON.stringify(res.body);
  assert.equal(output.includes('bankAccountNumber'), false);
  assert.equal(output.includes('PRIVATE'), false);
});
