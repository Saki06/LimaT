const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../dist/config/prisma');
const subscription = require('../dist/controllers/subscription.controller');
const tenantController = require('../dist/controllers/tenant.controller');

const original = {
  tenantFindFirst: prisma.tenant.findFirst,
  tenantFindMany: prisma.tenant.findMany,
  tenantFindUnique: prisma.tenant.findUnique,
  tenantUpdate: prisma.tenant.update,
  subscriptionFindMany: prisma.tenantSubscription.findMany,
  enrollmentFindMany: prisma.enrollment.findMany,
  transaction: prisma.$transaction,
};
let tenantData;
let updatedTenantSettings;
let createdSubscription;

const setMethod = (delegate, key, value) => Object.defineProperty(delegate, key, { configurable: true, value });
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const activeTenant = (settings = {}) => ({
  id: 'tenant-a', name: 'Tenant A', slug: 'tenant-a', plan: 'STARTER', status: 'ACTIVE', deletedAt: null,
  settings, createdAt: new Date(),
});

test.after(() => {
  setMethod(prisma.tenant, 'findFirst', original.tenantFindFirst);
  setMethod(prisma.tenant, 'findMany', original.tenantFindMany);
  setMethod(prisma.tenant, 'findUnique', original.tenantFindUnique);
  setMethod(prisma.tenant, 'update', original.tenantUpdate);
  setMethod(prisma.tenantSubscription, 'findMany', original.subscriptionFindMany);
  setMethod(prisma.enrollment, 'findMany', original.enrollmentFindMany);
  prisma.$transaction = original.transaction;
});

test('subscription plan loads from the authenticated tenant scope', async () => {
  setMethod(prisma.tenant, 'findFirst', async ({ where }) => where.id === 'tenant-a' ? activeTenant({ enabledFeatures: { live_broadcast_studio: false } }) : null);
  setMethod(prisma.tenantSubscription, 'findMany', async () => []);
  setMethod(prisma.enrollment, 'findMany', async () => []);
  setMethod(prisma.tenant, 'findMany', async () => []);
  const res = response();
  await subscription.getMySubscription({ user: { tenantId: 'tenant-a', role: 'TEACHER' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.tenant.id, 'tenant-a');
  assert.equal(res.body.data.plans.length, 3);
});

test('card plan payment is rejected without creating a payment request', async () => {
  let lookups = 0;
  setMethod(prisma.tenant, 'findFirst', async () => { lookups += 1; return activeTenant(); });
  const res = response();
  await subscription.submitPaymentRequest({ user: { tenantId: 'tenant-a', role: 'TEACHER' }, body: { paymentMethod: 'CARD' } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(lookups, 0);
});

test('tenant feature whitelist rejects unknown keys and accepts valid authorized keys', async () => {
  let writes = 0;
  setMethod(prisma.tenant, 'findUnique', async () => activeTenant({ brand: 'Kept' }));
  setMethod(prisma.tenant, 'update', async ({ data }) => { writes += 1; updatedTenantSettings = data.settings; return activeTenant(data.settings); });
  let res = response();
  await tenantController.updateTenantFeatures({ params: { id: 'tenant-a' }, body: { enabledFeatures: { unknown_feature: true } } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(writes, 0);

  res = response();
  await tenantController.updateTenantFeatures({ params: { id: 'tenant-a' }, body: { enabledFeatures: {
    tutor_branding: true,
    sub_tutor_saas_subscription: true,
    sub_tutor_card_payment: false,
    sub_tutor_bank_slip_payment: true,
  } } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(updatedTenantSettings.brand, 'Kept');
  assert.equal(writes, 1);
});

test('bank slip stays pending and only Super Admin approval activates SaaS plan', async () => {
  tenantData = activeTenant();
  updatedTenantSettings = null;
  createdSubscription = null;
  setMethod(prisma.tenant, 'findFirst', async ({ where }) => where.id === 'tenant-a' ? tenantData : null);
  setMethod(prisma.tenant, 'findMany', async () => []);
  setMethod(prisma.enrollment, 'findMany', async () => []);
  setMethod(prisma.tenant, 'update', async ({ data }) => {
    tenantData = { ...tenantData, ...data, settings: data.settings };
    updatedTenantSettings = data.settings;
    return tenantData;
  });
  const requestRes = response();
  await subscription.submitPaymentRequest({
    user: { tenantId: 'tenant-a', role: 'TEACHER' },
    body: {
      plan: 'PRO', reference: 'BANK-REF-123', transferDate: new Date().toISOString().slice(0, 10),
      slipImage: 'data:image/png;base64,aGVsbG8=', paymentMethod: 'BANK_SLIP',
    },
  }, requestRes);
  assert.equal(requestRes.statusCode, 202);
  assert.equal(tenantData.plan, 'STARTER');
  assert.ok(tenantData.settings.pendingPlanRequest);

  const pending = tenantData.settings.pendingPlanRequest;
  const decisionRes = response();
  prisma.$transaction = async (callback) => callback({
    tenant: {
      findFirst: async () => tenantData,
      update: async ({ data }) => { tenantData = { ...tenantData, ...data, settings: data.settings }; updatedTenantSettings = data.settings; return tenantData; },
    },
    tenantSubscription: {
      updateMany: async () => ({ count: 0 }),
      create: async ({ data }) => { createdSubscription = data; return data; },
    },
  });
  await subscription.decidePaymentRequest({
    user: { role: 'SUPER_ADMIN' },
    params: { tenantId: 'tenant-a' },
    body: { decision: 'APPROVE' },
  }, decisionRes);
  assert.equal(decisionRes.statusCode, 200);
  assert.equal(tenantData.plan, 'PRO');
  assert.equal(createdSubscription.status, 'ACTIVE');
  assert.equal(updatedTenantSettings.enabledFeatures.sub_tutor_card_payment, false);
  assert.equal(updatedTenantSettings.enabledFeatures.sub_tutor_bank_slip_payment, true);
  assert.equal(pending.reference, 'BANK-REF-123');
});
