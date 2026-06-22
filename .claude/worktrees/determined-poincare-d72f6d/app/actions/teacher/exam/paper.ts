"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/lib/generated/prisma/enums";

async function requireTeacher() {
  const session = await auth();

  if (!session || session.user.role !== Role.TEACHER) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function getExamPaperData(examId: string) {
  await requireTeacher();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: true,
      questions: {
        include: {
          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!exam) throw new Error("Exam not found");

  return exam;
}