"use server";

// app/actions/teacher/get-single-activity-content.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSingleActivityContentAction(
  id: string
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  )
    return null;

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
        },
      }
    );

  return item;
}