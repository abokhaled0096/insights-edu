import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentCoursesClient from "@/components/dashboard/student/courses-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          _count: { select: { students: true, teachers: true } },
          teachers: {
            select: {
              teacher: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const courses = enrollments.map((e) => ({
    id: e.course.id,
    name: e.course.name,
    code: e.course.code,
    description: e.course.description,
    studentsCount: e.course._count.students,
    teachersCount: e.course._count.teachers,
    teacherName: e.course.teachers[0]?.teacher?.name || "غير محدد",
  }));

  return (
    <div className="p-6">
      <StudentCoursesClient courses={courses} />
    </div>
  );
}
