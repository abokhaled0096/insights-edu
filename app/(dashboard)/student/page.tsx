// app/(dashboard)/student/page.tsx

import StudentDashboardPage from "@/components/dashboard/student/dashboard-client";

import { getStudentDashboardAction } from "@/app/actions/student/get-dashboard";

export default async function Page() {
  const data =
    await getStudentDashboardAction();

  return (
    <div className="p-6">
      <StudentDashboardPage
        data={data}
      />
    </div>
  );
}