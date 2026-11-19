-- Add a per-user session version so password changes invalidate existing JWTs.
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
