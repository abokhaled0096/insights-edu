"use server";


import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSingleActivityAction(
  id: string
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    return null;
  }

  const teacherId =
    session.user.id;

  const item =
    await prisma.studentActivity.findFirst(
      {
        where: {
          id,

          course: {
            teachers: {
              some: {
                teacherId,
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
        },
      }
    );

  if (!item)
    return null;

  return {
    id: item.id,
    title:
      item.title,
    description:
      item.description,
    type: item.type,
    points:
      item.points,

    dueDate:
      item.dueDate?.toISOString() ||
      null,

    courseId:
      item.courseId,

    course:
      item.course,
  };
}