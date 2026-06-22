// app/(dashboard)/student/assignments/page.tsx

import StudentAssignmentsPage from "@/components/dashboard/student/assignments-client";

import { getStudentAssignmentsAction } from "@/app/actions/student/get-assignments";

export default async function Page() {
  const assignments =
    await getStudentAssignmentsAction();

  return (
    <div className="p-6">
      <StudentAssignmentsPage
        assignments={
          assignments
        }
      />
    </div>
  );
}