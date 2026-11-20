-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('CAPTAIN', 'VICE_CAPTAIN', 'PLAYER', 'COACH', 'SUPPORT_STAFF');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_CONFIRMATION', 'PAYMENT_STATUS_CHANGE', 'FIXTURE_SCHEDULE', 'MATCH_REMINDER', 'MATCH_RESULT', 'TEAM_ANNOUNCEMENT', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PROVINCE', 'DISTRICT');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BracketType" AS ENUM ('KNOCKOUT', 'GROUP', 'ROUND_ROBIN', 'LEAGUE');

-- CreateEnum
CREATE TYPE "BracketPosition" AS ENUM ('WINNER_BRACKET', 'LOSER_BRACKET', 'GROUP_STAGE');

-- AlterTable
ALTER TABLE "SportsEvent" ADD COLUMN     "registrationCloseDate" TIMESTAMP(3),
ADD COLUMN     "registrationOpenDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SportsTeam" ADD COLUMN     "coachId" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "isCoach" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sports" TEXT[] DEFAULT ARRAY[]::TEXT[];

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

-- CreateTable
CREATE TABLE "TournamentBracket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "type" "BracketType" NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "stageName" TEXT NOT NULL DEFAULT 'Round 1',
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentBracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BracketMatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "fixtureId" TEXT,
    "matchNumber" INTEGER NOT NULL,
    "team1Id" TEXT,
    "team1Name" TEXT,
    "team1Score" INTEGER,
    "team2Id" TEXT,
    "team2Name" TEXT,
    "team2Score" INTEGER,
    "winnerId" TEXT,
    "winnerName" TEXT,
    "position" "BracketPosition" NOT NULL DEFAULT 'WINNER_BRACKET',
    "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "venue" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BracketMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveMatchUpdate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "period" INTEGER NOT NULL DEFAULT 1,
    "periodTime" TEXT,
    "event" TEXT,
    "playerName" TEXT,
    "teamId" TEXT,
    "updateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveMatchUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixtureCalendarView" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filterCriteria" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixtureCalendarView_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "TournamentBracket_tenantId_tournamentId_status_idx" ON "TournamentBracket"("tenantId", "tournamentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentBracket_tenantId_tournamentId_stage_key" ON "TournamentBracket"("tenantId", "tournamentId", "stage");

-- CreateIndex
CREATE INDEX "BracketMatch_tenantId_bracketId_status_idx" ON "BracketMatch"("tenantId", "bracketId", "status");

-- CreateIndex
CREATE INDEX "BracketMatch_tenantId_fixtureId_idx" ON "BracketMatch"("tenantId", "fixtureId");

-- CreateIndex
CREATE UNIQUE INDEX "BracketMatch_tenantId_bracketId_matchNumber_key" ON "BracketMatch"("tenantId", "bracketId", "matchNumber");

-- CreateIndex
CREATE INDEX "LiveMatchUpdate_tenantId_fixtureId_createdAt_idx" ON "LiveMatchUpdate"("tenantId", "fixtureId", "createdAt");

-- CreateIndex
CREATE INDEX "LiveMatchUpdate_tenantId_fixtureId_updateTime_idx" ON "LiveMatchUpdate"("tenantId", "fixtureId", "updateTime");

-- CreateIndex
CREATE INDEX "FixtureCalendarView_tenantId_isPublic_idx" ON "FixtureCalendarView"("tenantId", "isPublic");

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

-- CreateIndex
CREATE INDEX "SportsEvent_registrationCloseDate_idx" ON "SportsEvent"("registrationCloseDate");

-- CreateIndex
CREATE INDEX "SportsTeam_coachId_idx" ON "SportsTeam"("coachId");

-- AddForeignKey
ALTER TABLE "SportsTeam" ADD CONSTRAINT "SportsTeam_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "TournamentBracket" ADD CONSTRAINT "TournamentBracket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentBracket" ADD CONSTRAINT "TournamentBracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "SportsTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "TournamentBracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "SportsFixture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatchUpdate" ADD CONSTRAINT "LiveMatchUpdate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatchUpdate" ADD CONSTRAINT "LiveMatchUpdate_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "SportsFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixtureCalendarView" ADD CONSTRAINT "FixtureCalendarView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
