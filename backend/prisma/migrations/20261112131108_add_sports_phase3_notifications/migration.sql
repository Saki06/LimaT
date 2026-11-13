-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentVia" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailNotificationService" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "senderEmail" TEXT NOT NULL,
    "senderName" TEXT,
    "providerConfig" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailNotificationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSNotificationService" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "senderPhoneOrId" TEXT NOT NULL,
    "providerConfig" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSNotificationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushNotificationService" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "providerConfig" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotificationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" TEXT NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDeliveryLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "recipientPushToken" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_tenantId_recipientId_read_idx" ON "Notification"("tenantId", "recipientId", "read");

-- CreateIndex
CREATE INDEX "Notification_tenantId_recipientId_createdAt_idx" ON "Notification"("tenantId", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_tenantId_type_idx" ON "Notification"("tenantId", "type");

-- CreateIndex
CREATE INDEX "EmailNotificationService_tenantId_isActive_idx" ON "EmailNotificationService"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EmailNotificationService_tenantId_provider_key" ON "EmailNotificationService"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "SMSNotificationService_tenantId_isActive_idx" ON "SMSNotificationService"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SMSNotificationService_tenantId_provider_key" ON "SMSNotificationService"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "PushNotificationService_tenantId_isActive_idx" ON "PushNotificationService"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PushNotificationService_tenantId_provider_key" ON "PushNotificationService"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "NotificationTemplate_tenantId_isActive_idx" ON "NotificationTemplate"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_tenantId_type_channel_key" ON "NotificationTemplate"("tenantId", "type", "channel");

-- CreateIndex
CREATE INDEX "NotificationDeliveryLog_tenantId_notificationId_idx" ON "NotificationDeliveryLog"("tenantId", "notificationId");

-- CreateIndex
CREATE INDEX "NotificationDeliveryLog_tenantId_status_createdAt_idx" ON "NotificationDeliveryLog"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryLog_tenantId_nextRetryAt_idx" ON "NotificationDeliveryLog"("tenantId", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailNotificationService" ADD CONSTRAINT "EmailNotificationService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSNotificationService" ADD CONSTRAINT "SMSNotificationService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushNotificationService" ADD CONSTRAINT "PushNotificationService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDeliveryLog" ADD CONSTRAINT "NotificationDeliveryLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
