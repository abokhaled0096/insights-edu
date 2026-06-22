/// app/actions/teacher/assignment-submissions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";

async function requireTeacher() {
  const session = await auth();

  if (!session || session.user.role !== Role.TEACHER) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/* ------------------------------------------------ */
/* Get submissions for one assignment               */
/* ------------------------------------------------ */

export async function getTeacherAssignmentSubmissions(
  assignmentId: string
) {
  const user = await requireTeacher();

  const assignment =
    await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: user.id,
      },
      include: {
        course: true,
        submissions: {
          include: {
            student: true,
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
      },
    });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
}

/* ------------------------------------------------ */
/* Grade submission                                 */
/* ------------------------------------------------ */

export async function gradeAssignmentSubmission(
  formData: FormData
) {
  const user = await requireTeacher();

  const submissionId = formData.get(
    "submissionId"
  ) as string;

  const grade = Number(
    formData.get("grade")
  );

  const submission =
    await prisma.assignmentSubmission.findFirst({
      where: {
        id: submissionId,
        assignment: {
          teacherId: user.id,
        },
      },
      include: {
        assignment: true,
      },
    });

  if (!submission) {
    throw new Error("Submission not found");
  }

  await prisma.assignmentSubmission.update({
    where: {
      id: submissionId,
    },
    data: {
      grade,
      status: "GRADED",
    },
  });

  revalidatePath(
    `/teacher/assignments/${submission.assignmentId}/submissions`
  );

  return { success: true };
}