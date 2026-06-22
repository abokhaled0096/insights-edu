import { notFound } from "next/navigation";
import { getCourseAction } from "@/app/actions/admin/get-course";
import { getStudentsAction } from "@/app/actions/admin/get-students";
import CourseDetailsClient from "@/components/dashboard/admin/course-details-client";

export default async function CourseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const course = await getCourseAction(id);

  if (!course) {
    notFound();
  }

  // Fetch all students for the enrollment modal
  const allStudents = await getStudentsAction();

  return (
    <div className="p-6">
      <CourseDetailsClient
        course={course}
        allStudents={allStudents}
      />
    </div>
  );
}
