/*
  Warnings:

  - Added the required column `target` to the `ImportJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ImportJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImportJob" DROP CONSTRAINT "ImportJob_schoolYearId_fkey";

-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "target" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "schoolYearId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ImportIssue_importJobId_idx" ON "ImportIssue"("importJobId");

-- CreateIndex
CREATE INDEX "ImportIssue_severity_idx" ON "ImportIssue"("severity");

-- CreateIndex
CREATE INDEX "ImportIssue_resolved_idx" ON "ImportIssue"("resolved");

-- CreateIndex
CREATE INDEX "ImportJob_target_idx" ON "ImportJob"("target");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- CreateIndex
CREATE INDEX "ImportJob_schoolYearId_idx" ON "ImportJob"("schoolYearId");

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
