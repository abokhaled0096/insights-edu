"use server";

// app/actions/student/get-assignments.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentAssignmentsAction() {
  try {
    const session =
      await auth();

    if (!session?.user?.id) {
      return [];
    }

    const studentId =
      session.user.id;

    const assignments =
      await prisma.assignment.findMany(
        {
          where: {
            course: {
              students: {
                some: {
                  studentId,
                },
              },
            },
          },

          orderBy: {
            dueDate:
              "asc",
          },

          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },

            submissions: {
              where: {
                studentId,
              },

              select: {
                id: true,
                fileUrl: true,
                grade: true,
                status: true,
                submittedAt: true,
              },
            },
          },
        }
      );

    return assignments.map(
      (item) => ({
        id: item.id,
        title: item.title,
        description:
          item.description,
        dueDate:
          item.dueDate.toISOString(),

        course: {
          id: item.course.id,
          name: item.course.name,
          code: item.course.code,
        },

        submission:
          item.submissions[0]
            ? {
                id: item
                  .submissions[0]
                  .id,

                fileUrl:
                  item
                    .submissions[0]
                    .fileUrl,

                grade:
                  item
                    .submissions[0]
                    .grade,

                status:
                  item
                    .submissions[0]
                    .status,

                submittedAt:
                  item
                    .submissions[0]
                    .submittedAt
                    ?.toISOString() ||
                  null,
              }
            : null,
      })
    );
  } catch (error) {
    console.error(
      error
    );

    return [];
  }
}