import StudentsPage from "@/components/dashboard/admin/students-client";
import { getStudentsAction } from "@/app/actions/admin/get-students";

export default async function Page() {
  const students =
    await getStudentsAction();

  return (
    <div className="p-6">
      <StudentsPage
        students={students}
      />
    </div>
  );
}