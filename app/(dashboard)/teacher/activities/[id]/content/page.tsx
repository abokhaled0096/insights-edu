import { notFound } from "next/navigation";

import ActivityContentBuilder from "@/components/dashboard/teacher/activity-content-builder";

import { getSingleActivityContentAction } from "@/app/actions/teacher/get-single-activity-content";

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
    await getSingleActivityContentAction(
      id
    );

  if (!activity)
    notFound();

  return (
    <div className="p-6">
      <ActivityContentBuilder
        activity={
          activity
        }
      />
    </div>
  );
}