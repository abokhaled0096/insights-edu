import { notFound } from "next/navigation";
import { getStudentDetailAction } from "@/app/actions/advisor/get-student-detail";
import StudentDetailClient from "@/components/dashboard/advisor/student-detail-client";

export default async function AdvisorStudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const student = await getStudentDetailAction(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="p-6">
      <StudentDetailClient student={student} />
    </div>
  );
}
