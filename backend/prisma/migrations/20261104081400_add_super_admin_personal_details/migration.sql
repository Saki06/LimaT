/*
  Warnings:

  - A unique constraint covering the columns `[rootAuthorityId]` on the table `SuperAdminProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SuperAdminProfile" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "rootAuthorityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminProfile_rootAuthorityId_key" ON "SuperAdminProfile"("rootAuthorityId");
