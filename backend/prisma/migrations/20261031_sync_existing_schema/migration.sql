-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."LiveClassStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LiveMeetingPlatform" AS ENUM ('JITSI', 'GOOGLE_MEET', 'ZOOM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('PAST_PAPER', 'TUTE', 'BOOK');

-- CreateEnum
CREATE TYPE "public"."ResourceVisibility" AS ENUM ('PUBLIC', 'SUBSCRIBERS_ONLY');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'MARKED', 'RESULT_RELEASED');

-- AlterTable
ALTER TABLE "public"."TeacherProfile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankBranch" TEXT,
ADD COLUMN     "bankBranchCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "experienceYears" INTEGER DEFAULT 0,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mediums" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "publicSlug" TEXT,
ADD COLUMN     "qualifications" JSONB DEFAULT '[]',
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 4.9,
ADD COLUMN     "sltsRegNo" TEXT,
ADD COLUMN     "telegramUrl" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "whatsappNumber" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT,
    "teacherId" TEXT NOT NULL,
    "subjectName" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "topicName" TEXT,
    "dueDate" TIMESTAMP(3),
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "textContent" TEXT,
    "fileAttachmentUrl" TEXT,
    "fileAttachmentName" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "marksObtained" DOUBLE PRECISION,
    "teacherFeedback" TEXT,
    "markedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LibraryResource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "packageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "public"."ResourceType" NOT NULL DEFAULT 'PAST_PAPER',
    "subject" TEXT NOT NULL,
    "topic" TEXT,
    "category" TEXT,
    "year" INTEGER,
    "medium" TEXT,
    "examType" TEXT,
    "paperPart" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" TEXT,
    "fileType" TEXT NOT NULL DEFAULT 'pdf',
    "coverImage" TEXT,
    "hasMarkingScheme" BOOLEAN NOT NULL DEFAULT false,
    "markingSchemeUrl" TEXT,
    "markingSchemeNotes" TEXT,
    "timeAllowedMinutes" INTEGER DEFAULT 180,
    "visibility" "public"."ResourceVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" TEXT NOT NULL DEFAULT 'published',
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LiveClassAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LiveClassAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LiveClassSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT,
    "packageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "public"."LiveClassStatus" NOT NULL DEFAULT 'SCHEDULED',
    "platform" "public"."LiveMeetingPlatform" NOT NULL DEFAULT 'JITSI',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "passcode" TEXT,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_courseId_idx" ON "public"."Assignment"("courseId" ASC);

-- CreateIndex
CREATE INDEX "Assignment_teacherId_idx" ON "public"."Assignment"("teacherId" ASC);

-- CreateIndex
CREATE INDEX "Assignment_tenantId_status_idx" ON "public"."Assignment"("tenantId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "AssignmentSubmission_assignmentId_status_idx" ON "public"."AssignmentSubmission"("assignmentId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "public"."AssignmentSubmission"("assignmentId" ASC, "studentId" ASC);

-- CreateIndex
CREATE INDEX "AssignmentSubmission_studentId_idx" ON "public"."AssignmentSubmission"("studentId" ASC);

-- CreateIndex
CREATE INDEX "LibraryResource_packageId_idx" ON "public"."LibraryResource"("packageId" ASC);

-- CreateIndex
CREATE INDEX "LibraryResource_subject_idx" ON "public"."LibraryResource"("subject" ASC);

-- CreateIndex
CREATE INDEX "LibraryResource_teacherId_idx" ON "public"."LibraryResource"("teacherId" ASC);

-- CreateIndex
CREATE INDEX "LibraryResource_tenantId_visibility_idx" ON "public"."LibraryResource"("tenantId" ASC, "visibility" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "LiveClassAttendance_sessionId_studentId_key" ON "public"."LiveClassAttendance"("sessionId" ASC, "studentId" ASC);

-- CreateIndex
CREATE INDEX "LiveClassAttendance_studentId_idx" ON "public"."LiveClassAttendance"("studentId" ASC);

-- CreateIndex
CREATE INDEX "LiveClassSession_courseId_idx" ON "public"."LiveClassSession"("courseId" ASC);

-- CreateIndex
CREATE INDEX "LiveClassSession_packageId_idx" ON "public"."LiveClassSession"("packageId" ASC);

-- CreateIndex
CREATE INDEX "LiveClassSession_teacherId_status_idx" ON "public"."LiveClassSession"("teacherId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "LiveClassSession_tenantId_status_idx" ON "public"."LiveClassSession"("tenantId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_publicSlug_key" ON "public"."TeacherProfile"("publicSlug" ASC);

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryResource" ADD CONSTRAINT "LibraryResource_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryResource" ADD CONSTRAINT "LibraryResource_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryResource" ADD CONSTRAINT "LibraryResource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassAttendance" ADD CONSTRAINT "LiveClassAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."LiveClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassAttendance" ADD CONSTRAINT "LiveClassAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassSession" ADD CONSTRAINT "LiveClassSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassSession" ADD CONSTRAINT "LiveClassSession_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassSession" ADD CONSTRAINT "LiveClassSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveClassSession" ADD CONSTRAINT "LiveClassSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
