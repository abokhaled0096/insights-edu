import ExamForm from "@/components/dashboard/teacher/exam/form";
import { prisma } from "@/lib/prisma";

export default async function NewExamPage() {
  const rawCourses = await prisma.teacherCourse.findMany({
    include: {
      course: { select: { id: true, name: true, code: true } },
    },
  });

  // Serialize for client component
  const teacherCourses = rawCourses.map((tc) => ({
    id: tc.id,
    teacherId: tc.teacherId,
    courseId: tc.courseId,
    course: tc.course,
  }));

  return (
    <div className="p-6">
      <ExamForm teacherCourses={teacherCourses} />
    </div>
  );
}