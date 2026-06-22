// app/(dashboard)/student/assignments/[id]/page.tsx

import AssignmentSubmitPage from "@/components/dashboard/student/assignment-submit-client";
import { getSingleAssignmentAction } from "@/app/actions/student/get-single-assignment";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const assignment =
    await getSingleAssignmentAction(
      id
    );

  return (
    <div className="p-6">
      <AssignmentSubmitPage
        assignment={
          assignment
        }
      />
    </div>
  );
}