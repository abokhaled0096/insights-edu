// app/(dashboard)/teacher/activities/[id]/edit/page.tsx

import { notFound } from "next/navigation";

import EditActivityPage from "@/components/dashboard/teacher/edit-activity-page";

import { getSingleActivityAction } from "@/app/actions/teacher/get-single-activity";
import { getTeacherActivitiesAction } from "@/app/actions/teacher/get-activities";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const [
    activity,
    data,
  ] =
    await Promise.all([
      getSingleActivityAction(
        id
      ),
      getTeacherActivitiesAction(),
    ]);

  if (!activity)
    notFound();

  return (
    <div className="p-6">
      <EditActivityPage
        activity={
          activity
        }
        courses={
          data.courses
        }
      />
    </div>
  );
}