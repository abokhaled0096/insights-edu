"use server";


import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentActivityContentAction(
  activityId: string
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return null;
    }

    const studentId =
      session.user.id;

    const activity =
      await prisma.studentActivity.findFirst(
        {
          where: {
            id: activityId,

            course: {
              students: {
                some: {
                  studentId,
                },
              },
            },
          },

          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },

            contents: {
              orderBy: {
                sortOrder:
                  "asc",
              },
            },

            attachments:
              {
                orderBy:
                  {
                    createdAt:
                      "desc",
                  },
              },

            submissions:
              {
                where:
                  {
                    studentId,
                  },
                take: 1,
              },
          },
        }
      );

    if (!activity)
      return null;

    return {
      id: activity.id,
      title:
        activity.title,
      description:
        activity.description,
      type: activity.type,
      points:
        activity.points,

      dueDate:
        activity.dueDate?.toISOString() ||
        null,

      createdAt:
        activity.createdAt.toISOString(),

      course:
        activity.course,

      contents:
        activity.contents.map(
          (
            item
          ) => ({
            id: item.id,
            type: item.type,
            title:
              item.title,
            body:
              item.body,
            sortOrder:
              item.sortOrder,
          })
        ),

      attachments:
        activity.attachments.map(
          (
            file
          ) => ({
            id: file.id,
            fileName:
              file.fileName,
            fileUrl:
              file.fileUrl,
            fileSize:
              file.fileSize,
          })
        ),

      submission:
        activity
          .submissions[0]
          ? {
              id:
                activity
                  .submissions[0]
                  .id,

              textAnswer:
                activity
                  .submissions[0]
                  .textAnswer,

              fileUrl:
                activity
                  .submissions[0]
                  .fileUrl,

              score:
                activity
                  .submissions[0]
                  .score,

              feedback:
                activity
                  .submissions[0]
                  .feedback,

              status:
                activity
                  .submissions[0]
                  .status,
            }
          : null,
    };
  } catch (
    error
  ) {
    console.error(
      error
    );

    return null;
  }
}