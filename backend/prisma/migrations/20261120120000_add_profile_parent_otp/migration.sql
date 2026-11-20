-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "district" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "medium" TEXT,
ADD COLUMN     "stream" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "staffStatus" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildLinkRequest" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildLinkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpChallenge_email_purpose_createdAt_idx" ON "OtpChallenge"("email", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_expiresAt_consumedAt_idx" ON "OtpChallenge"("expiresAt", "consumedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildLinkRequest_tokenHash_key" ON "ParentChildLinkRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentChildLinkRequest_parentId_expiresAt_idx" ON "ParentChildLinkRequest"("parentId", "expiresAt");

-- CreateIndex
CREATE INDEX "ParentChildLinkRequest_studentId_expiresAt_idx" ON "ParentChildLinkRequest"("studentId", "expiresAt");

-- AddForeignKey
ALTER TABLE "ParentChildLinkRequest" ADD CONSTRAINT "ParentChildLinkRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLinkRequest" ADD CONSTRAINT "ParentChildLinkRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
