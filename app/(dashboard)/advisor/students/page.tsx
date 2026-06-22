import { getAdvisorStudentsAction } from "@/app/actions/advisor/get-students";
import AdvisorStudentsClient from "@/components/dashboard/advisor/students-client";

export default async function AdvisorStudentsPage() {
  const students = await getAdvisorStudentsAction();
  return (
    <div className="p-6">
      <AdvisorStudentsClient students={students} />
    </div>
  );
}
