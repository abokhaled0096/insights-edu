
import TeacherActionsPage from "@/components/dashboard/admin/teacher-action-page";
import { getTeachersAction } from "@/app/actions/admin/get-teachers";

export default async function Page() {
  const teachers =
    await getTeachersAction();

  return (
    <div className="p-6">
      <TeacherActionsPage
        teachers={teachers}
      />
    </div>
  );
}