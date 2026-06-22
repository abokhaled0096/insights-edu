// app/(dashboard)/teacher/activities/available/page.tsx

import TeacherAvailableActivitiesPage from "@/components/dashboard/teacher/available-activities-page";

import { getAvailableActivitiesAction } from "@/app/actions/teacher/get-available-activities";

export default async function Page() {
  const data =
    await getAvailableActivitiesAction();

  return (
    <div className="p-6">
      <TeacherAvailableActivitiesPage
        stats={
          data.stats
        }
        activities={
          data.activities
        }
      />
    </div>
  );
}