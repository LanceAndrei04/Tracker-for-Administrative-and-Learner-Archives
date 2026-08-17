-- CreateEnum
CREATE TYPE "TeacherStationStatus" AS ENUM ('OWN_STATION', 'REASSIGNED', 'BORROWED', 'CLUSTERED');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "gender" TEXT,
    "birthday" TIMESTAMP(3),
    "civilStatus" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "stationStatus" "TeacherStationStatus",
    "degreeFinished" TEXT,
    "prcSpecialization" TEXT,
    "minorSpecialization" TEXT,
    "postGraduateDegree" TEXT,
    "originalAppointmentDate" TIMESTAMP(3),
    "stationStartDate" TIMESTAMP(3),
    "cellphoneNumber" TEXT,
    "personalEmail" TEXT,
    "depEdEmail" TEXT,
    "office365Account" TEXT,
    "r4a3Account" TEXT,
    "province" TEXT,
    "town" TEXT,
    "barangay" TEXT,
    "street" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeNumber_key" ON "Teacher"("employeeNumber");

-- CreateIndex
CREATE INDEX "Teacher_lastName_firstName_idx" ON "Teacher"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Teacher_designation_idx" ON "Teacher"("designation");

-- CreateIndex
CREATE INDEX "Teacher_archivedAt_idx" ON "Teacher"("archivedAt");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
