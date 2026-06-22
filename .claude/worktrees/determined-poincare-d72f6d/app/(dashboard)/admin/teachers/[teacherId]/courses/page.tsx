import { prisma } from "@/lib/prisma";
import AssignTeacherCourseForm from "@/components/dashboard/admin/assign-teacher-course-form";

export default async function TeacherCoursesPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const teacher = await prisma.user.findUnique({
    where: {
      id: (await params).teacherId,
      role: "TEACHER",
    },
    include: {
      teachings: {
        include: {
          course: true,
        },
      },
    },
  });

  const courses = await prisma.course.findMany();

  if (!teacher) return <div>Teacher not found</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold">{teacher.name}</h1>

      <AssignTeacherCourseForm
        teacherId={teacher.id}
        courses={courses}
      />

      <div className="space-y-2">
        {teacher.teachings.map((item) => (
          <div key={item.id} className="border p-3 rounded">
            {item.course.name}
          </div>
        ))}
      </div>
    </div>
  );
}