/// app/teacher/assignments/[id]/submissions/page.tsx

import {
  getTeacherAssignmentSubmissions,
} from "@/app/actions/teacher/assignments/submission";

import ClientPage from "@/components/dashboard/teacher/assignment/submission-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
  const data =
    await getTeacherAssignmentSubmissions(
      resolvedParams.id
    );

  return (
    <ClientPage
      assignment={data}
    />
  );
}