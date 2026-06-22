import { prisma } from "@/lib/prisma";
import ExamTable from "@/components/dashboard/teacher/exam/exam-teble";
import Link from "next/link";

export default async function TeacherExamsPage() {
  const rawExams = await prisma.exam.findMany({
    include: {
      course: true,
      _count: {
        select: {
          questions: true,
          papers: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize Date objects for client component
  const exams = rawExams.map((e) => ({
    id: e.id,
    title: e.title,
    courseId: e.courseId,
    course: { id: e.course.id, name: e.course.name, code: e.course.code },
    _count: e._count,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">Teacher Exams</h1>
        <Link href="/teacher/exams/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Exam
        </Link>
      </div>
      <ExamTable exams={exams} />
    </div>
  );
}