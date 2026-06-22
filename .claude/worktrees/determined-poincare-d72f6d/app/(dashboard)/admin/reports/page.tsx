// app/(dashboard)/admin/reports/page.tsx

import ReportsPage from "@/components/dashboard/admin/reports-client";
import { getReportsAction } from "@/app/actions/admin/get-reports";

export default async function Page() {
  const data =
    await getReportsAction();

  return (
    <div className="p-6">
      <ReportsPage
        data={data}
      />
    </div>
  );
}