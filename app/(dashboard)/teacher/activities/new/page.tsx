
import TeacherActivitiesPage from "@/components/dashboard/teacher/activities-client";

import { getTeacherActivitiesAction } from "@/app/actions/teacher/get-activities";

export default async function Page() {
  const data =
    await getTeacherActivitiesAction();

  return (
    <div className="p-6 space-y-6">
      <TeacherActivitiesPage
        courses={data.courses}
        activities={data.activities}
        stats={data.stats}
      />
    </div>
  );
}