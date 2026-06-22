"use server";

import { prisma } from "@/lib/prisma";
import {
  revalidatePath,
} from "next/cache";

type UpdateExamInput =
  {
    examId: string;
    title: string;
  };

export async function updateExam(
  data: UpdateExamInput
) {
  await prisma.exam.update({
    where: {
      id: data.examId,
    },
    data: {
      title:
        data.title,
    },
  });

  revalidatePath(
    "/teacher/exams"
  );

  revalidatePath(
    `/teacher/exams/${data.examId}`
  );

  revalidatePath(
    `/teacher/exams/${data.examId}/edit`
  );

  return {
    success: true,
  };
}