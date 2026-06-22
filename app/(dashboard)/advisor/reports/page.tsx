import { getAdvisorReportAction } from "@/app/actions/advisor/get-report";
import AdvisorReportsClient from "@/components/dashboard/advisor/reports-client";

export default async function AdvisorReportsPage() {
  const data = await getAdvisorReportAction();
  return (
    <div className="p-6">
      <AdvisorReportsClient data={data} />
    </div>
  );
}
