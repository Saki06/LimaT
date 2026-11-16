ALTER TABLE "TeacherProfile"
ADD COLUMN "sports" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isCoach" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "SportsTeam"
ADD COLUMN "coachId" TEXT;

CREATE INDEX "SportsTeam_coachId_idx" ON "SportsTeam"("coachId");

ALTER TABLE "SportsTeam"
ADD CONSTRAINT "SportsTeam_coachId_fkey"
FOREIGN KEY ("coachId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
