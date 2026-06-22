// app/(dashboard)/teacher/attendance/page.tsx

import TeacherAttendancePage from "@/components/dashboard/teacher/attendance-client";

import {
  getAttendancePageAction,
} from "@/app/actions/teacher/attendance";

export default async function Page() {
  const data =
    await getAttendancePageAction();

  return (
    <div className="p-6">
      <TeacherAttendancePage
        data={data}
      />
    </div>
  );
}