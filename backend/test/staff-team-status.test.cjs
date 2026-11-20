const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../dist/config/prisma');
const admin = require('../dist/controllers/admin.controller');

const methods = [
  [prisma.tenant, 'findFirst'], [prisma.user, 'findUnique'], [prisma.user, 'findFirst'],
  [prisma.user, 'updateMany'], [prisma.sportsTeam, 'findMany'], [prisma.$transaction ? prisma : null, '$transaction'],
  [prisma.teacherProfile, 'updateMany'], [prisma.teacherProfile, 'update'],
];
const original = methods.map(([delegate, key]) => delegate ? [delegate, key, delegate[key]] : null);
const setMethod = (delegate, key, value) => Object.defineProperty(delegate, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test.after(() => {
  for (const item of original) if (item) setMethod(item[0], item[1], item[2]);
});

test('staff creation validates tenant team IDs and persists coach assignment', async () => {
  let profileData;
  let teamAssignment;
  setMethod(prisma.tenant, 'findFirst', async () => ({ id: 'tenant-a' }));
  setMethod(prisma.user, 'findUnique', async () => null);
  setMethod(prisma.sportsTeam, 'findMany', async ({ where }) => {
    assert.deepEqual(where, { id: { in: ['team-a'] }, tenantId: 'tenant-a' });
    return [{ id: 'team-a', name: 'Falcons' }];
  });
  prisma.$transaction = async (callback) => callback({
    $queryRaw: async () => [],
    tenant: { findUnique: async () => ({ id: 'tenant-a' }) },
    user: { create: async ({ data }) => ({ id: 'coach-user-a', ...data }) },
    teacherProfile: { create: async ({ data }) => { profileData = data; return { id: 'profile-a' }; } },
    sportsTeam: { updateMany: async (args) => { teamAssignment = args; return { count: 1 }; } },
    setupToken: { create: async () => ({ id: 'setup-token-a' }) },
  });
  const res = response();
  await admin.createStaff({ headers: {}, user: { userId: 'admin-a', role: 'ADMIN', tenantId: 'tenant-a' }, body: {
    name: 'Coach A', email: 'coach@example.com', role: 'coach', teamIds: ['team-a'], status: 'active',
  } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body.data.teamIds, ['team-a']);
  assert.equal(profileData.staffStatus, 'active');
  assert.equal(teamAssignment.where.tenantId, 'tenant-a');
  assert.equal(teamAssignment.data.coachId, 'coach-user-a');
});

test('staff status changes persist both user activity and profile status', async () => {
  let userData;
  let profileData;
  setMethod(prisma.tenant, 'findFirst', async () => ({ id: 'tenant-a' }));
  setMethod(prisma.user, 'findFirst', async () => ({ id: 'staff-a', role: 'TEACHER', tenantId: 'tenant-a' }));
  setMethod(prisma.user, 'updateMany', async ({ data }) => { userData = data; return { count: 1 }; });
  setMethod(prisma.teacherProfile, 'updateMany', async ({ data }) => { profileData = data; return { count: 1 }; });
  const res = response();
  await admin.updateStaffStatus({ headers: {}, user: { userId: 'admin-a', role: 'ADMIN', tenantId: 'tenant-a' }, params: { id: 'staff-a' }, body: { status: 'on_leave' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(userData, { isActive: false });
  assert.deepEqual(profileData, { staffStatus: 'on_leave' });
});

test('administrator staff can update tenant-owned account fields without a teacher profile', async () => {
  let updateArgs;
  setMethod(prisma.tenant, 'findFirst', async ({ where }) => ({ id: where.id }));
  setMethod(prisma.user, 'findFirst', async ({ where }) => where.email ? null : ({
    id: where.id, tenantId: 'tenant-a', role: 'ADMIN', email: 'admin@example.com',
    firstName: 'Old', lastName: 'Name', teacherProfile: null, coachedSportsTeams: [],
  }));
  setMethod(prisma.user, 'updateMany', async (args) => { updateArgs = args; return { count: 1 }; });
  const res = response();
  await admin.updateStaff({
    headers: {}, user: { userId: 'school-admin', role: 'ADMIN', tenantId: 'tenant-a' }, params: { id: 'staff-admin' },
    body: { name: 'New Name', email: 'new@example.com', role: 'administrator', status: 'inactive' },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(updateArgs.where, { id: 'staff-admin', tenantId: 'tenant-a', role: 'ADMIN' });
  assert.deepEqual(updateArgs.data, { firstName: 'New', lastName: 'Name', email: 'new@example.com', isActive: false });
  assert.equal(res.body.data.role, 'administrator');
});

test('teacher and coach updates retain tenant-scoped profile and team writes', async () => {
  let userUpdate;
  let profileUpdate;
  let teamUpdates = 0;
  setMethod(prisma.tenant, 'findFirst', async ({ where }) => ({ id: where.id }));
  setMethod(prisma.user, 'findFirst', async ({ where }) => ({
    id: where.id, tenantId: 'tenant-a', role: 'TEACHER', email: 'coach@example.com',
    firstName: 'Old', lastName: 'Coach', teacherProfile: { id: 'profile-a', isCoach: false, sports: [] },
    coachedSportsTeams: [],
  }));
  setMethod(prisma.sportsTeam, 'findMany', async ({ where }) => {
    assert.deepEqual(where, { id: { in: ['team-a'] }, tenantId: 'tenant-a' });
    return [{ id: 'team-a', name: 'Falcons' }];
  });
  prisma.$transaction = async (callback) => callback({
    user: { updateMany: async (args) => { userUpdate = args; return { count: 1 }; } },
    teacherProfile: { update: async (args) => { profileUpdate = args; } },
    sportsTeam: { updateMany: async () => { teamUpdates += 1; return { count: 1 }; } },
  });
  const res = response();
  await admin.updateStaff({
    headers: {}, user: { userId: 'school-admin', role: 'ADMIN', tenantId: 'tenant-a' }, params: { id: 'staff-teacher' },
    body: { name: 'New Coach', role: 'coach', teamIds: ['team-a'], status: 'on_leave' },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(userUpdate.where, { id: 'staff-teacher', tenantId: 'tenant-a', role: 'TEACHER' });
  assert.deepEqual(userUpdate.data, { firstName: 'New', lastName: 'Coach', isActive: false });
  assert.equal(profileUpdate.where.id, 'profile-a');
  assert.equal(profileUpdate.data.isCoach, true);
  assert.equal(profileUpdate.data.staffStatus, 'on_leave');
  assert.equal(teamUpdates, 2);
  assert.equal(res.body.data.role, 'coach');
});
