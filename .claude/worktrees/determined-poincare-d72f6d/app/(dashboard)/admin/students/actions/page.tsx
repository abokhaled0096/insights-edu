
import StudentActionsPage from "@/components/dashboard/admin/student-actions-page";
import { getStudentsAction } from "@/app/actions/admin/get-students";

export default async function Page() {
  const students =
    await getStudentsAction();

  return (
    <div className="p-6">
      <StudentActionsPage
        students={students}
      />
    </div>
  );
}