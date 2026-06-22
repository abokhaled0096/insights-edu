"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExam(data: {
  title: string;
  courseId: string;
}) {
  await prisma.exam.create({
    data: {
      title: data.title,
      courseId: data.courseId,
    },
  });

  revalidatePath("/teacher/exams");
}

export async function deleteExam(examId: string) {
  await prisma.exam.delete({
    where: { id: examId },
  });

  revalidatePath("/teacher/exams");
}

export async function generateExamPapers(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!exam) return;

  for (const enrollment of exam.course.students) {
    await prisma.studentExamPaper.create({
      data: {
        examId,
        studentId: enrollment.studentId,
        uniqueCode: crypto.randomUUID(),
      },
    });
  }

  revalidatePath(`/teacher/exams/${examId}/papers`);
}