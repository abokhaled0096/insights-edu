// app/(dashboard)/teacher/page.tsx

import TeacherDashboardPage from "@/components/dashboard/teacher/client";

import { getTeacherDashboardAction } from "@/app/actions/teacher/get-dashboard";

export default async function Page() {
  const data =
    await getTeacherDashboardAction();

  return (
    <div className="p-6">
      <TeacherDashboardPage
        data={data}
      />
    </div>
  );
}