import { getAdvisorDashboardAction } from "@/app/actions/advisor/get-dashboard";
import AdvisorDashboardClient from "@/components/dashboard/advisor/client-page";

export default async function Page() {
  const data = await getAdvisorDashboardAction();
  return (
    <div className="p-6">
      <AdvisorDashboardClient data={data} />
    </div>
  );
}
