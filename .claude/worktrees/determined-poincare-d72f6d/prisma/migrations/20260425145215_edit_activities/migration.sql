/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TASK', 'QUIZ', 'PROJECT', 'EXAM', 'EVENT');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_courseId_fkey";

-- DropTable
DROP TABLE "Activity";

-- CreateTable
CREATE TABLE "StudentActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "points" INTEGER NOT NULL DEFAULT 0,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentActivity_studentId_idx" ON "StudentActivity"("studentId");

-- CreateIndex
CREATE INDEX "StudentActivity_courseId_idx" ON "StudentActivity"("courseId");

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
