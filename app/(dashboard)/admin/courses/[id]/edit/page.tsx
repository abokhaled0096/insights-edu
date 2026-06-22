import { notFound } from "next/navigation";
import { getCourseAction } from "@/app/actions/admin/get-course";
import EditCourseClient from "@/components/dashboard/admin/edit-course-client";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const course = await getCourseAction(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="p-6">
      <EditCourseClient course={course} />
    </div>
  );
}
