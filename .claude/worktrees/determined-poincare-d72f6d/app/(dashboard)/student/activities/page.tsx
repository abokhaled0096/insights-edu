// app/(dashboard)/student/activities/page.tsx

import StudentActivitiesPage from "@/components/dashboard/student/activities-client";

import { getStudentActivitiesAction } from "@/app/actions/student/get-activities";

export default async function Page() {
  const data =
    await getStudentActivitiesAction();

  return (
    <div className="p-6">
      <StudentActivitiesPage
        activities={
          data.activities
        }
        stats={
          data.stats
        }
      />
    </div>
  );
}