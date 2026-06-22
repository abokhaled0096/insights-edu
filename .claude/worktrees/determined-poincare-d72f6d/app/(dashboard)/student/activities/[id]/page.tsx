
import { notFound } from "next/navigation";

import StudentActivityContentPage from "@/components/dashboard/student/activity-content-page";
import SubmitActivityForm from "@/components/dashboard/student/submit-activity-form";

import { getStudentActivityContentAction } from "@/app/actions/student/get-activity-content";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const activity =
    await getStudentActivityContentAction(
      id
    );

  if (!activity)
    notFound();

  return (
    <div className="p-6">
      <StudentActivityContentPage
        activity={
          activity
        }
      />
      <SubmitActivityForm
        activityId={id}
      />
    </div>
  );
}