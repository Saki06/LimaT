const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
const { prisma } = require('../dist/config/prisma');
const auth = require('../dist/controllers/auth.controller');
const { hashSetupToken } = require('../dist/utils/setupToken');

const secret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

function response() {
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

function installTransactionMocks({ claimCount = 1, tenantStatus = 'ACTIVE' } = {}) {
  const setupToken = 'test-setup-token';
  const user = {
    id: 'user-a',
    email: 'user@example.com',
    role: 'STUDENT',
    tenantId: 'tenant-a',
    firstName: 'Test',
    lastName: 'User',
  };
  const updatedUser = {
    ...user,
    tokenVersion: 4,
    mustChangePassword: false,
  };

  prisma.$transaction = async (callback) => callback({
    setupToken: {
      findFirst: async ({ where }) => (
        where.tokenHash === hashSetupToken(setupToken) &&
        where.usedAt === null &&
        where.expiresAt.gt instanceof Date
          ? { id: 'token-a', tenantId: 'tenant-a', userId: 'user-a' }
          : null
      ),
      updateMany: async ({ where }) => (
        where.id === 'token-a' ? { count: claimCount } : { count: 1 }
      ),
    },
    user: {
      findFirst: async () => user,
      update: async () => updatedUser,
    },
    tenant: {
      findFirst: async () => (
        tenantStatus === 'ACTIVE' ? { id: 'tenant-a' } : null
      ),
    },
  });
}

test('setup password rejects cross-tenant setup attempts', async () => {
  installTransactionMocks();
  const res = response();

  await auth.setupPassword({
    body: {
      setupToken: 'test-setup-token',
      tenantId: 'tenant-b',
      newPassword: 'ValidPassword9!',
      confirmPassword: 'ValidPassword9!',
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Invalid, expired/);
});

test('setup password atomically claims token and invalidates the old session version', async () => {
  installTransactionMocks();
  const res = response();

  await auth.setupPassword({
    body: {
      setupToken: 'test-setup-token',
      tenantId: 'tenant-a',
      newPassword: 'ValidPassword9!',
      confirmPassword: 'ValidPassword9!',
    },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.tokenVersion, 4);
  assert.equal(jwt.verify(res.body.token, secret).tokenVersion, 4);
});

test('setup password rejects a token that another request already claimed', async () => {
  installTransactionMocks({ claimCount: 0 });
  const res = response();

  await auth.setupPassword({
    body: {
      setupToken: 'test-setup-token',
      newPassword: 'ValidPassword9!',
      confirmPassword: 'ValidPassword9!',
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Invalid, expired/);
});
