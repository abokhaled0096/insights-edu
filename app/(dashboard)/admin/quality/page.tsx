import { getQualityReportsAction } from "@/app/actions/admin/get-quality-reports";
import QualityReportsClient from "@/components/dashboard/admin/quality-reports-client";

export default async function QualityReportsPage() {
  const data = await getQualityReportsAction();
  return (
    <div className="p-6">
      <QualityReportsClient data={data} />
    </div>
  );
}
