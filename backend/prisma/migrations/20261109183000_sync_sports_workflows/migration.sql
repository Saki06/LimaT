ALTER TABLE "SportsEvent"
ADD COLUMN IF NOT EXISTS "disciplineId" TEXT,
ADD COLUMN IF NOT EXISTS "ageCategory" TEXT,
ADD COLUMN IF NOT EXISTS "gender" TEXT,
ADD COLUMN IF NOT EXISTS "fee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maxParticipants" INTEGER,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "isTeamSport" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "SportsRegistration"
ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT,
ADD COLUMN IF NOT EXISTS "athleteDetails" JSONB,
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "totalAmount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "SportsDiscipline" (
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

CREATE TABLE IF NOT EXISTS "SportsTeam" (
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

CREATE TABLE IF NOT EXISTS "SportsTournament" (
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
    "participatingTeams" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
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

CREATE TABLE IF NOT EXISTS "SportsFixture" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "SportsDiscipline_tenantId_name_key"
ON "SportsDiscipline"("tenantId", "name");
CREATE INDEX IF NOT EXISTS "SportsTeam_tenantId_sportName_idx"
ON "SportsTeam"("tenantId", "sportName");
CREATE INDEX IF NOT EXISTS "SportsTournament_tenantId_sportName_status_idx"
ON "SportsTournament"("tenantId", "sportName", "status");
CREATE INDEX IF NOT EXISTS "SportsFixture_tenantId_sportName_date_idx"
ON "SportsFixture"("tenantId", "sportName", "date");
CREATE INDEX IF NOT EXISTS "SportsFixture_tenantId_competitionName_status_idx"
ON "SportsFixture"("tenantId", "competitionName", "status");
CREATE INDEX IF NOT EXISTS "SportsRegistration_registrationNumber_idx"
ON "SportsRegistration"("registrationNumber");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsEvent_disciplineId_fkey') THEN
        ALTER TABLE "SportsEvent"
        ADD CONSTRAINT "SportsEvent_disciplineId_fkey"
        FOREIGN KEY ("disciplineId") REFERENCES "SportsDiscipline"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsDiscipline_tenantId_fkey') THEN
        ALTER TABLE "SportsDiscipline"
        ADD CONSTRAINT "SportsDiscipline_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsTeam_tenantId_fkey') THEN
        ALTER TABLE "SportsTeam"
        ADD CONSTRAINT "SportsTeam_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsTournament_tenantId_fkey') THEN
        ALTER TABLE "SportsTournament"
        ADD CONSTRAINT "SportsTournament_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsFixture_tenantId_fkey') THEN
        ALTER TABLE "SportsFixture"
        ADD CONSTRAINT "SportsFixture_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SportsFixture_tournamentId_fkey') THEN
        ALTER TABLE "SportsFixture"
        ADD CONSTRAINT "SportsFixture_tournamentId_fkey"
        FOREIGN KEY ("tournamentId") REFERENCES "SportsTournament"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
