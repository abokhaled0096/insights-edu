/*
  Warnings:

  - You are about to drop the column `teacherId` on the `AttendanceSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttendanceSession" DROP CONSTRAINT "AttendanceSession_teacherId_fkey";

-- DropIndex
DROP INDEX "AttendanceSession_teacherId_idx";

-- AlterTable
ALTER TABLE "AttendanceSession" DROP COLUMN "teacherId";
