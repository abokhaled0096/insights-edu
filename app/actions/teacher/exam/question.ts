"use server";

import { prisma } from "@/lib/prisma";
import {
  revalidatePath,
} from "next/cache";

export async function addQuestion(
  data: any
) {
  const count =
    await prisma.question.count({
      where: {
        examId:
          data.examId,
      },
    });

  await prisma.question.create({
    data: {
      examId:
        data.examId,
      text: data.text,
      type: data.type,
      marks:
        Number(
          data.marks
        ) || 1,
      correctAnswer:
        data.correctAnswer,
      order:
        count + 1,

      options: {
        create: [
          {
            label:
              "A",
            text:
              data.optionA,
            sortOrder: 1,
          },
          {
            label:
              "B",
            text:
              data.optionB,
            sortOrder: 2,
          },
          {
            label:
              "C",
            text:
              data.optionC ||
              "",
            sortOrder: 3,
          },
          {
            label:
              "D",
            text:
              data.optionD ||
              "",
            sortOrder: 4,
          },
        ],
      },
    },
  });

  revalidatePath(
    `/teacher/exams/${data.examId}/edit`
  );
}

export async function deleteQuestion(
  questionId: string,
  examId: string
) {
  await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  revalidatePath(
    `/teacher/exams/${examId}/edit`
  );
}