/// app/teacher/exams/[id]/paper/page.tsx

import { getExamPaperData } from "@/app/actions/teacher/exam/paper";
import ClientPage from "@/components/dashboard/teacher/exam/paper-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const exam = await getExamPaperData(resolvedParams.id);

  return <ClientPage exam={exam} />;
}