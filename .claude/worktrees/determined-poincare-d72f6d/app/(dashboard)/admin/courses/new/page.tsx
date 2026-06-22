
import CreateCourseForm from "@/components/dashboard/admin/create-course-form";
import { createCourseAction } from "@/app/actions/admin/create-course";

export default function Page() {
  return (
    <div className="p-6">
      <CreateCourseForm action={createCourseAction} />
    </div>
  );
}