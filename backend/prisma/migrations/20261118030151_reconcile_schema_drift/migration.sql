-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "authorName" TEXT DEFAULT 'Principal''s Office',
ADD COLUMN     "authorRole" TEXT DEFAULT 'ADMIN',
ADD COLUMN     "category" TEXT DEFAULT 'GENERAL',
ADD COLUMN     "priority" TEXT DEFAULT 'normal',
ADD COLUMN     "targetAudience" TEXT DEFAULT 'Platform-Wide (Everyone)';

-- AlterTable
ALTER TABLE "PackageSubscription" ADD COLUMN     "bankRefNo" TEXT,
ADD COLUMN     "paymentMethod" TEXT DEFAULT 'CARD',
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "receiptNo" TEXT,
ADD COLUMN     "slipFileName" TEXT,
ADD COLUMN     "slipUrl" TEXT;

-- AlterTable
ALTER TABLE "SportsEvent" ADD COLUMN     "ageCategory" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "disciplineId" TEXT,
ADD COLUMN     "fee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "isTeamSport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxParticipants" INTEGER;

-- AlterTable
ALTER TABLE "SportsRegistration" ADD COLUMN     "athleteDetails" JSONB,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SportsDiscipline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "iconName" TEXT NOT NULL DEFAULT 'Trophy',
    "isTeamSport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTeam" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sportName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coachName" TEXT NOT NULL DEFAULT '',
    "trainingSchedule" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "playersCount" INTEGER NOT NULL DEFAULT 0,
    "players" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTournament" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sportName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "teamsCount" INTEGER NOT NULL DEFAULT 0,
    "participatingTeams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "trophyTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT,
    "currentRound" TEXT,
    "champion" TEXT,
    "runnerUp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsFixture" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "sportName" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeDistrict" TEXT,
    "awayDistrict" TEXT,
    "competitionName" TEXT NOT NULL,
    "roundName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "homeScore" TEXT,
    "awayScore" TEXT,
    "outcome" TEXT,
    "recordedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsFixture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportsDiscipline_tenantId_name_key" ON "SportsDiscipline"("tenantId", "name");

-- CreateIndex
CREATE INDEX "SportsTeam_tenantId_sportName_idx" ON "SportsTeam"("tenantId", "sportName");

-- CreateIndex
CREATE INDEX "SportsTournament_tenantId_sportName_status_idx" ON "SportsTournament"("tenantId", "sportName", "status");

-- CreateIndex
CREATE INDEX "SportsFixture_tenantId_sportName_date_idx" ON "SportsFixture"("tenantId", "sportName", "date");

-- CreateIndex
CREATE INDEX "SportsFixture_tenantId_competitionName_status_idx" ON "SportsFixture"("tenantId", "competitionName", "status");

-- CreateIndex
CREATE INDEX "Announcement_tenantId_isPinned_idx" ON "Announcement"("tenantId", "isPinned");

-- CreateIndex
CREATE INDEX "PackageSubscription_receiptNo_idx" ON "PackageSubscription"("receiptNo");

-- CreateIndex
CREATE INDEX "SportsRegistration_registrationNumber_idx" ON "SportsRegistration"("registrationNumber");

-- AddForeignKey
ALTER TABLE "SportsEvent" ADD CONSTRAINT "SportsEvent_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SportsDiscipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsDiscipline" ADD CONSTRAINT "SportsDiscipline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeam" ADD CONSTRAINT "SportsTeam_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTournament" ADD CONSTRAINT "SportsTournament_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsFixture" ADD CONSTRAINT "SportsFixture_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsFixture" ADD CONSTRAINT "SportsFixture_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "SportsTournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
