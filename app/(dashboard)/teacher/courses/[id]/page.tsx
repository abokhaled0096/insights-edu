import { notFound } from "next/navigation";
import { getCourseAction } from "@/app/actions/admin/get-course";
import TeacherCourseDetailsClient from "@/components/dashboard/teacher/course-details-client";

export default async function TeacherCourseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const course = await getCourseAction(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="p-6">
      <TeacherCourseDetailsClient course={course} />
    </div>
  );
}
