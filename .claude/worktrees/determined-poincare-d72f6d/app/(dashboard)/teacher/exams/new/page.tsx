import ExamForm from "@/components/dashboard/teacher/exam/form";
import { prisma } from "@/lib/prisma";

export async function getCourses() {
  return await prisma.teacherCourse.findMany({
    include: {
      course: true,
    },
  });
}
export default async function NewExamPage() {
  const courses = await getCourses();
  return (
    <div className="p-6">
      <ExamForm teacherCourses={courses} />
    </div>
  );
}