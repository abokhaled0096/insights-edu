import { renderToStream } from '@react-pdf/renderer';
import { ExamPdfDocument } from '@/components/dashboard/teacher/exam/exam-pdf-document';
import { prisma } from '@/lib/prisma';
import { generateQrMap } from '@/lib/pdf-utils';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const examId = params.id;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { options: true } }, course: true }
  });

  if (!exam) return new NextResponse("Exam not found", { status: 404 });

  // جلب الطلاب المسجلين في المادة
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: exam.courseId },
    include: { student: true }
  });
  const students = enrollments.map(e => e.student);

  // توليد جميع الـ QR Codes المطلوبة
  const qrCodes = await generateQrMap(exam, students);

  // إنشاء Stream لملف الـ PDF
  const stream = await renderToStream(
    <ExamPdfDocument exam={exam} students={students} qrCodes={qrCodes} />
  );

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=exam-${examId}.pdf`,
    },
  });
}