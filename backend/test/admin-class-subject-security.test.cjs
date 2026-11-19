const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
const { prisma } = require('../dist/config/prisma');
const admin = require('../dist/controllers/admin.controller');

const tenantState = {
  'tenant-a': {
    id: 'tenant-a',
    settings: {
      brand: 'Tenant A',
      classes: [{ id: 'cls-a', name: 'A Class' }],
      subjects: [{ id: 'sub-a', name: 'A Subject' }],
    },
  },
  'tenant-b': {
    id: 'tenant-b',
    settings: {
      brand: 'Tenant B',
      classes: [{ id: 'cls-b', name: 'B Class' }],
      subjects: [{ id: 'sub-b', name: 'B Subject' }],
    },
  },
};

let transactionQueue = Promise.resolve();
let provisionState;

function installPrismaMocks() {
  for (const tenant of Object.values(tenantState)) {
    tenant.settings = tenant.settings;
  }

  prisma.tenant.findFirst = async ({ where }) => {
    const tenant = tenantState[where.id];
    if (!tenant || tenant.deletedAt || tenant.status === 'INACTIVE' || tenant.status === 'SUSPENDED') {
      return null;
    }
    return { id: tenant.id };
  };

  prisma.tenant.findUnique = async ({ where }) => tenantState[where.id] || null;

  prisma.tenant.update = async ({ where, data }) => {
    tenantState[where.id].settings = data.settings;
    return tenantState[where.id];
  };

  prisma.user.findUnique = async () => null;

  prisma.$transaction = (callback) => {
    const staged = {
      users: [],
      teacherProfiles: [],
      studentProfiles: [],
      setupTokens: [],
    };

    const tx = {
      $queryRaw: async () => [{ id: 'locked' }],
      tenant: {
        findUnique: async ({ where }) => tenantState[where.id] || null,
        update: async ({ where, data }) => {
          tenantState[where.id].settings = data.settings;
          return tenantState[where.id];
        },
      },
      user: {
        create: async ({ data }) => {
          const user = {
            id: `usr-${provisionState.users.length + provisionState.nextUserId}`,
            ...data,
          };
          staged.users.push(user);
          return user;
        },
      },
      teacherProfile: {
        create: async ({ data }) => {
          if (provisionState.failNextProfile) {
            provisionState.failNextProfile = false;
            throw new Error('Mock teacher profile failure');
          }
          const profile = { id: `teacher-profile-${provisionState.nextProfileId}`, ...data };
          provisionState.nextProfileId += 1;
          staged.teacherProfiles.push(profile);
          return profile;
        },
      },
      studentProfile: {
        create: async ({ data }) => {
          if (provisionState.failNextProfile) {
            provisionState.failNextProfile = false;
            throw new Error('Mock student profile failure');
          }
          const profile = { id: `student-profile-${provisionState.nextProfileId}`, ...data };
          provisionState.nextProfileId += 1;
          staged.studentProfiles.push(profile);
          return profile;
        },
      },
      setupToken: {
        create: async ({ data }) => {
          if (provisionState.failNextSetupToken) {
            provisionState.failNextSetupToken = false;
            throw new Error('Mock setup token failure');
          }
          const setupToken = { id: `setup-token-${provisionState.nextSetupTokenId}`, ...data };
          provisionState.nextSetupTokenId += 1;
          staged.setupTokens.push(setupToken);
          return setupToken;
        },
      },
    };

    const run = transactionQueue.then(async () => {
      await callback(tx);
      provisionState.users.push(...staged.users);
      provisionState.teacherProfiles.push(...staged.teacherProfiles);
      provisionState.studentProfiles.push(...staged.studentProfiles);
      provisionState.setupTokens.push(...staged.setupTokens);
    });
    transactionQueue = run.catch(() => undefined);
    return run;
  };
}

function resetState() {
  tenantState['tenant-a'].settings = {
    brand: 'Tenant A',
    classes: [{ id: 'cls-a', name: 'A Class' }],
    subjects: [{ id: 'sub-a', name: 'A Subject' }],
  };
  tenantState['tenant-b'].settings = {
    brand: 'Tenant B',
    classes: [{ id: 'cls-b', name: 'B Class' }],
    subjects: [{ id: 'sub-b', name: 'B Subject' }],
  };
  transactionQueue = Promise.resolve();
  provisionState = {
    users: [],
    teacherProfiles: [],
    studentProfiles: [],
    setupTokens: [],
    nextUserId: 1,
    nextProfileId: 1,
    nextSetupTokenId: 1,
    failNextProfile: false,
    failNextSetupToken: false,
  };
  installPrismaMocks();
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function adminRequest(tenantId = 'tenant-a', headers = {}) {
  return {
    headers,
    body: {},
    params: {},
    user: {
      userId: 'admin-a',
      email: 'admin-a@example.com',
      role: 'ADMIN',
      tenantId,
    },
  };
}

test('Tenant A GET is isolated and rejects Tenant B header manipulation', async () => {
  resetState();

  const manipulated = createResponse();
  await admin.getClasses(
    adminRequest('tenant-a', { 'x-tenant-id': 'tenant-b' }),
    manipulated
  );
  assert.equal(manipulated.statusCode, 403);

  const allowed = createResponse();
  await admin.getClasses(adminRequest(), allowed);
  assert.equal(allowed.statusCode, 200);
  assert.deepEqual(allowed.body.data, [{ id: 'cls-a', name: 'A Class' }]);

  const subjects = createResponse();
  await admin.getSubjects(adminRequest(), subjects);
  assert.equal(subjects.statusCode, 200);
  assert.deepEqual(subjects.body.data, [{ id: 'sub-a', name: 'A Subject' }]);
});

test('Tenant A POST cannot target Tenant B', async () => {
  resetState();

  const classReq = adminRequest('tenant-a', { 'x-tenant-id': 'tenant-b' });
  classReq.body = { name: 'Injected Class' };
  const classRes = createResponse();
  await admin.createClass(classReq, classRes);

  const subjectReq = adminRequest('tenant-a', { 'x-tenant-id': 'tenant-b' });
  subjectReq.body = { name: 'Injected Subject' };
  const subjectRes = createResponse();
  await admin.createSubject(subjectReq, subjectRes);

  assert.equal(classRes.statusCode, 403);
  assert.equal(subjectRes.statusCode, 403);
  assert.equal(tenantState['tenant-b'].settings.classes.length, 1);
  assert.equal(tenantState['tenant-b'].settings.subjects.length, 1);
});

test('PUT/DELETE known Tenant B IDs cannot mutate Tenant A or Tenant B', async () => {
  resetState();

  const updateClassReq = adminRequest();
  updateClassReq.params = { id: 'cls-b' };
  updateClassReq.body = { name: 'Compromised' };
  const updateClassRes = createResponse();
  await admin.updateClass(updateClassReq, updateClassRes);
  assert.equal(updateClassRes.statusCode, 404);
  assert.equal(tenantState['tenant-b'].settings.classes[0].name, 'B Class');

  const updateSubjectReq = adminRequest();
  updateSubjectReq.params = { id: 'sub-b' };
  updateSubjectReq.body = { name: 'Compromised Subject' };
  const updateSubjectRes = createResponse();
  await admin.updateSubject(updateSubjectReq, updateSubjectRes);
  assert.equal(updateSubjectRes.statusCode, 404);
  assert.equal(tenantState['tenant-b'].settings.subjects[0].name, 'B Subject');

  const deleteClassReq = adminRequest();
  deleteClassReq.params = { id: 'cls-b' };
  const deleteClassRes = createResponse();
  await admin.deleteClass(deleteClassReq, deleteClassRes);
  assert.equal(deleteClassRes.statusCode, 404);

  const deleteSubjectReq = adminRequest();
  deleteSubjectReq.params = { id: 'sub-b' };
  const deleteSubjectRes = createResponse();
  await admin.deleteSubject(deleteSubjectReq, deleteSubjectRes);
  assert.equal(deleteSubjectRes.statusCode, 404);
});

test('Unknown class and subject IDs return 404', async () => {
  resetState();

  const classReq = adminRequest();
  classReq.params = { id: 'cls-unknown' };
  const classRes = createResponse();
  await admin.deleteClass(classReq, classRes);
  assert.equal(classRes.statusCode, 404);

  const subjectReq = adminRequest();
  subjectReq.params = { id: 'sub-unknown' };
  const subjectRes = createResponse();
  await admin.updateSubject(subjectReq, subjectRes);
  assert.equal(subjectRes.statusCode, 404);
});

test('Missing tenant selection and unknown tenants use safe status codes', async () => {
  resetState();

  const missingRes = createResponse();
  await admin.getClasses({
    headers: {},
    user: {
      userId: 'super',
      email: 'super@example.com',
      role: 'SUPER_ADMIN',
      tenantId: null,
    },
  }, missingRes);
  assert.equal(missingRes.statusCode, 400);

  const unknownRes = createResponse();
  await admin.getSubjects({
    headers: { 'x-tenant-id': 'tenant-missing' },
    user: {
      userId: 'super',
      email: 'super@example.com',
      role: 'SUPER_ADMIN',
      tenantId: null,
    },
  }, unknownRes);
  assert.equal(unknownRes.statusCode, 404);
});

test('Concurrent class and subject creates preserve unrelated settings', async () => {
  resetState();

  const classReq = adminRequest();
  classReq.body = { name: 'Concurrent Class' };
  const subjectReq = adminRequest();
  subjectReq.body = { name: 'Concurrent Subject' };

  const classRes = createResponse();
  const subjectRes = createResponse();
  await Promise.all([
    admin.createClass(classReq, classRes),
    admin.createSubject(subjectReq, subjectRes),
  ]);

  assert.equal(classRes.statusCode, 201);
  assert.equal(subjectRes.statusCode, 201);
  assert.equal(tenantState['tenant-a'].settings.brand, 'Tenant A');
  assert.equal(tenantState['tenant-a'].settings.classes.length, 2);
  assert.equal(tenantState['tenant-a'].settings.subjects.length, 2);
});

test('Staff provisioning creates tenant-scoped user, profile and setup token', async () => {
  resetState();

  const req = adminRequest();
  req.body = {
    name: 'Secure Staff',
    email: 'secure.staff@example.test',
    role: 'teacher',
    staffId: 'EMP-SECURE',
  };

  const res = createResponse();
  await admin.createStaff(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(provisionState.users.length, 1);
  assert.equal(provisionState.teacherProfiles.length, 1);
  assert.equal(provisionState.setupTokens.length, 1);

  const user = provisionState.users[0];
  const profile = provisionState.teacherProfiles[0];
  const setupToken = provisionState.setupTokens[0];

  assert.equal(user.tenantId, 'tenant-a');
  assert.equal(user.mustChangePassword, true);
  assert.equal(profile.userId, user.id);
  assert.equal(setupToken.userId, user.id);
  assert.equal(setupToken.tenantId, 'tenant-a');
  assert.match(setupToken.tokenHash, /^[a-f0-9]{64}$/);
  assert.ok(setupToken.expiresAt instanceof Date);
  assert.ok(setupToken.createdAt instanceof Date);
  const expiryDuration = setupToken.expiresAt.getTime() - setupToken.createdAt.getTime();
  assert.ok(expiryDuration >= 29 * 60 * 1000);
  assert.ok(expiryDuration <= 30 * 60 * 1000);

  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'password'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'token'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'tokenHash'), false);
});

test('Student provisioning creates tenant-scoped user, profile and setup token', async () => {
  resetState();

  const req = adminRequest();
  req.body = {
    name: 'Secure Student',
    email: 'secure.student@example.test',
    grade: 'Grade 12',
    section: 'Physical Science',
  };

  const res = createResponse();
  await admin.createStudent(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(provisionState.users.length, 1);
  assert.equal(provisionState.studentProfiles.length, 1);
  assert.equal(provisionState.setupTokens.length, 1);

  const user = provisionState.users[0];
  const profile = provisionState.studentProfiles[0];
  const setupToken = provisionState.setupTokens[0];

  assert.equal(user.tenantId, 'tenant-a');
  assert.equal(user.mustChangePassword, true);
  assert.equal(profile.userId, user.id);
  assert.equal(setupToken.userId, user.id);
  assert.equal(setupToken.tenantId, 'tenant-a');
  assert.match(setupToken.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'password'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'token'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, 'tokenHash'), false);
});

test('Profile failure rolls back student user and setup token creation', async () => {
  resetState();
  provisionState.failNextProfile = true;

  const req = adminRequest();
  req.body = {
    name: 'Rollback Student',
    email: 'rollback.student@example.test',
  };

  const res = createResponse();
  await admin.createStudent(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(provisionState.users.length, 0);
  assert.equal(provisionState.studentProfiles.length, 0);
  assert.equal(provisionState.setupTokens.length, 0);
});

test('Setup token failure rolls back staff user and profile creation', async () => {
  resetState();
  provisionState.failNextSetupToken = true;

  const req = adminRequest();
  req.body = {
    name: 'Rollback Staff',
    email: 'rollback.staff@example.test',
    role: 'teacher',
  };

  const res = createResponse();
  await admin.createStaff(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(provisionState.users.length, 0);
  assert.equal(provisionState.teacherProfiles.length, 0);
  assert.equal(provisionState.setupTokens.length, 0);
});
