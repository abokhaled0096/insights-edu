/*
  Warnings:

  - You are about to drop the column `studentId` on the `StudentActivity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentActivity" DROP CONSTRAINT "StudentActivity_studentId_fkey";

-- DropIndex
DROP INDEX "StudentActivity_studentId_idx";

-- AlterTable
ALTER TABLE "StudentActivity" DROP COLUMN "studentId";
