"use client";

import { Button } from "antd";
import { generateExamPapers } from "@/app/actions/teacher/exam/exam-actions";

export default function GeneratePapersButton({
  examId,
}: {
  examId: string;
}) {
  return (
    <Button
      type="primary"
      onClick={() => generateExamPapers(examId)}
    >
      Generate Papers
    </Button>
  );
}