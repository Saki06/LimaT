CREATE UNIQUE INDEX "TenantSubscription_one_active_per_tenant"
ON "TenantSubscription" ("tenantId")
WHERE "status" = 'ACTIVE';
