-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_key" ON "Grade"("level");
