
import CoursesPage from "@/components/dashboard/admin/courses-client";
import { getCoursesAction } from "@/app/actions/admin/get-courses";

export default async function Page() {
  const courses =
    await getCoursesAction();

  return (
    <div className="p-6">
      <CoursesPage
        courses={courses}
      />
    </div>
  );
}