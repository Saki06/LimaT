/*
  Warnings:

  - The `status` column on the `SportsFixture` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BracketType" AS ENUM ('KNOCKOUT', 'GROUP', 'ROUND_ROBIN', 'LEAGUE');

-- CreateEnum
CREATE TYPE "BracketPosition" AS ENUM ('WINNER_BRACKET', 'LOSER_BRACKET', 'GROUP_STAGE');

-- AlterTable
ALTER TABLE "SportsFixture" DROP COLUMN "status",
ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING';

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
CREATE INDEX "SportsFixture_tenantId_competitionName_status_idx" ON "SportsFixture"("tenantId", "competitionName", "status");

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
