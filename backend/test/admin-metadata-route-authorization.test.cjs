const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../dist/config/prisma');
const { config } = require('../dist/config');

const originalUserFindUnique = prisma.user.findUnique;
const originalTenantFindUnique = prisma.tenant.findUnique;
const originalTenantFindFirst = prisma.tenant.findFirst;

test.after(() => {
  Object.defineProperty(prisma.user, 'findUnique', { configurable: true, value: originalUserFindUnique });
  Object.defineProperty(prisma.tenant, 'findUnique', { configurable: true, value: originalTenantFindUnique });
  Object.defineProperty(prisma.tenant, 'findFirst', { configurable: true, value: originalTenantFindFirst });
});

test('classes and subjects reads allow only tenant ADMIN and SUPER_ADMIN', async () => {
  let activeRole = 'ADMIN';
  const tenantLookups = [];
  prisma.user.findUnique = async ({ where }) => ({
    id: where.id,
    email: `${activeRole.toLowerCase()}@example.com`,
    role: activeRole,
    tenantId: 'tenant-a',
    isActive: true,
    mustChangePassword: false,
    tokenVersion: 0,
  });
  prisma.tenant.findUnique = async ({ where }) => ({
    id: where.id,
    status: 'ACTIVE',
    deletedAt: null,
    settings: { classes: [{ id: 'class-a' }], subjects: [{ id: 'subject-a' }] },
  });
  prisma.tenant.findFirst = async ({ where }) => {
    tenantLookups.push(where.id);
    return where.id === 'tenant-a' ? { id: 'tenant-a' } : null;
  };

  const app = express();
  app.use('/api/admin', require('../dist/routes/admin.routes').default);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const port = server.address().port;
    for (const role of ['ADMIN', 'SUPER_ADMIN']) {
      activeRole = role;
      const token = jwt.sign({ userId: 'user-a', role, tenantId: 'tenant-a', tokenVersion: 0 }, config.jwtSecret);
      for (const endpoint of ['classes', 'subjects']) {
        const response = await fetch(`http://127.0.0.1:${port}/api/admin/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}`, ...(role === 'SUPER_ADMIN' ? { 'x-tenant-id': 'tenant-a' } : {}) },
        });
        assert.equal(response.status, 200, `${role} should read ${endpoint}`);
      }
    }
    for (const role of ['STUDENT', 'PARENT']) {
      activeRole = role;
      const token = jwt.sign({ userId: 'user-a', role, tenantId: 'tenant-a', tokenVersion: 0 }, config.jwtSecret);
      for (const endpoint of ['classes', 'subjects']) {
        const response = await fetch(`http://127.0.0.1:${port}/api/admin/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(response.status, 403, `${role} must not read ${endpoint}`);
      }
    }
    assert.ok(tenantLookups.every((tenantId) => tenantId === 'tenant-a'));
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
