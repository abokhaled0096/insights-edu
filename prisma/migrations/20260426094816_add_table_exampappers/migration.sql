-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('GENERATED', 'PRINTED', 'SUBMITTED', 'SCANNED', 'PROCESSED', 'REVIEW_REQUIRED', 'GRADED');

-- CreateEnum
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "bubbleCount" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER,
ADD COLUMN     "x" INTEGER,
ADD COLUMN     "y" INTEGER;

-- CreateTable
CREATE TABLE "StudentExamPaper" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "uniqueCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "status" "PaperStatus" NOT NULL DEFAULT 'GENERATED',
    "scannedImage" TEXT,
    "processedImage" TEXT,
    "ocrStatus" "OCRStatus" NOT NULL DEFAULT 'PENDING',
    "totalScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswer" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "detectedAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OCRConfig" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 140,
    "blur" INTEGER NOT NULL DEFAULT 3,
    "invert" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OCRConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentExamPaper_uniqueCode_key" ON "StudentExamPaper"("uniqueCode");

-- CreateIndex
CREATE UNIQUE INDEX "StudentExamPaper_examId_studentId_key" ON "StudentExamPaper"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_paperId_questionId_key" ON "StudentAnswer"("paperId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "OCRConfig_examId_key" ON "OCRConfig"("examId");

-- AddForeignKey
ALTER TABLE "StudentExamPaper" ADD CONSTRAINT "StudentExamPaper_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExamPaper" ADD CONSTRAINT "StudentExamPaper_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "StudentExamPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OCRConfig" ADD CONSTRAINT "OCRConfig_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
