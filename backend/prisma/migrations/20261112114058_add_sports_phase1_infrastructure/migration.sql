-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('CAPTAIN', 'VICE_CAPTAIN', 'PLAYER', 'COACH', 'SUPPORT_STAFF');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_CONFIRMATION', 'PAYMENT_STATUS_CHANGE', 'FIXTURE_SCHEDULE', 'MATCH_REMINDER', 'MATCH_RESULT', 'TEAM_ANNOUNCEMENT', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PROVINCE', 'DISTRICT');

-- AlterTable
ALTER TABLE "SportsEvent" ADD COLUMN     "registrationCloseDate" TIMESTAMP(3),
ADD COLUMN     "registrationOpenDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SportsRegistrationPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentSlipUrl" TEXT,
    "paymentSlipFileName" TEXT,
    "receiptNumber" TEXT,
    "bankRefNo" TEXT,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsRegistrationPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTeamMember" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'PLAYER',
    "jerseyNumber" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SportsTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTeamInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsTeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "schoolName" TEXT,
    "province" TEXT,
    "district" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bloodType" TEXT,
    "emergencyContact" TEXT,
    "achievements" JSONB DEFAULT '[]',
    "participationHistory" JSONB DEFAULT '[]',
    "sportsInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isTeamInterested" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportsRegistrationPayment_receiptNumber_key" ON "SportsRegistrationPayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "SportsRegistrationPayment_registrationId_status_idx" ON "SportsRegistrationPayment"("registrationId", "status");

-- CreateIndex
CREATE INDEX "SportsRegistrationPayment_tenantId_status_idx" ON "SportsRegistrationPayment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SportsRegistrationPayment_receiptNumber_idx" ON "SportsRegistrationPayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "SportsRegistrationPayment_createdAt_idx" ON "SportsRegistrationPayment"("createdAt");

-- CreateIndex
CREATE INDEX "SportsTeamMember_tenantId_teamId_idx" ON "SportsTeamMember"("tenantId", "teamId");

-- CreateIndex
CREATE INDEX "SportsTeamMember_userId_idx" ON "SportsTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SportsTeamMember_teamId_userId_key" ON "SportsTeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SportsTeamInvitation_code_key" ON "SportsTeamInvitation"("code");

-- CreateIndex
CREATE INDEX "SportsTeamInvitation_code_idx" ON "SportsTeamInvitation"("code");

-- CreateIndex
CREATE INDEX "SportsTeamInvitation_tenantId_status_idx" ON "SportsTeamInvitation"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SportsTeamInvitation_teamId_userId_key" ON "SportsTeamInvitation"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteProfile_userId_key" ON "AthleteProfile"("userId");

-- CreateIndex
CREATE INDEX "AthleteProfile_district_idx" ON "AthleteProfile"("district");

-- CreateIndex
CREATE INDEX "AthleteProfile_province_idx" ON "AthleteProfile"("province");

-- CreateIndex
CREATE INDEX "AthleteProfile_createdAt_idx" ON "AthleteProfile"("createdAt");

-- CreateIndex
CREATE INDEX "SportsLocation_tenantId_type_isActive_idx" ON "SportsLocation"("tenantId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SportsLocation_tenantId_type_code_key" ON "SportsLocation"("tenantId", "type", "code");

-- CreateIndex
CREATE INDEX "Announcement_tenantId_isPinned_idx" ON "Announcement"("tenantId", "isPinned");

-- CreateIndex
CREATE INDEX "SportsEvent_registrationCloseDate_idx" ON "SportsEvent"("registrationCloseDate");

-- AddForeignKey
ALTER TABLE "SportsRegistrationPayment" ADD CONSTRAINT "SportsRegistrationPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsRegistrationPayment" ADD CONSTRAINT "SportsRegistrationPayment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "SportsRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamMember" ADD CONSTRAINT "SportsTeamMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamMember" ADD CONSTRAINT "SportsTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SportsTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamMember" ADD CONSTRAINT "SportsTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamInvitation" ADD CONSTRAINT "SportsTeamInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamInvitation" ADD CONSTRAINT "SportsTeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SportsTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeamInvitation" ADD CONSTRAINT "SportsTeamInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsLocation" ADD CONSTRAINT "SportsLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
