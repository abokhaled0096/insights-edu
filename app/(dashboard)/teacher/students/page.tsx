// app/(dashboard)/teacher/students/page.tsx

import MyStudentsPage from "@/components/dashboard/teacher/my-students-client";
import { getMyStudentsAction } from "@/app/actions/teacher/get-my-students";

export default async function Page() {
  const students =
    await getMyStudentsAction();

  return (
    <div className="p-6">
      <MyStudentsPage
        students={students}
      />
    </div>
  );
}