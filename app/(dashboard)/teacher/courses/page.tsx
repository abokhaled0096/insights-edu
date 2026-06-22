
import MyCoursesPage from "@/components/dashboard/teacher/my-courses-client";
import { getMyCoursesAction } from "@/app/actions/teacher/get-my-courses";

export default async function Page() {
  const courses =
    await getMyCoursesAction();

  return (
    <div className="p-6">
      <MyCoursesPage
        courses={courses}
      />
    </div>
  );
}