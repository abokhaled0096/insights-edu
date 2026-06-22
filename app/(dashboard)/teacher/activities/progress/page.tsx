// app/(dashboard)/teacher/activities/progress/page.tsx

import TeacherActivitiesProgressPage from "@/components/dashboard/teacher/activities-progress-client";

import { getTeacherActivitiesProgressAction } from "@/app/actions/teacher/get-activities-progress";

export default async function Page() {
  const activities =
    await getTeacherActivitiesProgressAction();

  return (
    <div className="p-6">
      <TeacherActivitiesProgressPage
        activities={
          activities
        }
      />
    </div>
  );
}