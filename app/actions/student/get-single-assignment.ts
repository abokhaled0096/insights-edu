"use server";

// app/actions/student/get-single-assignment.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSingleAssignmentAction(
  id: string
) {
  const session =
    await auth();

  const studentId =
    session?.user?.id;

  const assignment =
    await prisma.assignment.findUnique(
      {
        where: {
          id,
        },

        include: {
          course: true,

          submissions: {
            where: {
              studentId,
            },
          },
        },
      }
    );

  return {
    id: assignment!.id,
    title:
      assignment!.title,
    description:
      assignment!
        .description,
    dueDate:
      assignment!.dueDate.toISOString(),
    attachmentUrl:
      assignment!.attachmentUrl,

    course: {
      name: assignment!
        .course.name,
      code: assignment!
        .course.code,
    },

    submission:
      assignment!
        .submissions[0]
        ? {
            fileUrl:
              assignment!
                .submissions[0]
                .fileUrl,
            submittedAt:
              assignment!
                .submissions[0]
                .submittedAt
                ?.toISOString() ||
              null,
            status:
              assignment!
                .submissions[0]
                .status,
            grade:
              assignment!
                .submissions[0]
                .grade,
          }
        : null,
  };
}