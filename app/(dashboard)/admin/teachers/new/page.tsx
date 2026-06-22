// app/(dashboard)/admin/teachers/new/page.tsx

import CreateTeacherForm from "@/components/dashboard/admin/create-teacher-form";
import { createTeacherAction } from "@/app/actions/admin/create-teacher";

export default function Page() {
  return (
    <div className="p-6">
      <CreateTeacherForm action={createTeacherAction} />
    </div>
  );
}