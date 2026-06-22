"use server";


import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getMyCoursesAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return [];
    }

    const teacher =
      await prisma.user.findUnique(
        {
          where: {
            id: session
              .user.id,
          },

          select: {
            teachings: {
              select: {
                course: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    createdAt: true,

                    _count:
                      {
                        select:
                          {
                            students: true,
                          },
                      },
                  },
                },
              },
            },
          },
        }
      );

    return (
      teacher?.teachings.map(
        (item) => ({
          id: item.course.id,
          name: item.course.name,
          code: item.course.code,
          description:
            item.course
              .description,
          createdAt:
            item.course.createdAt.toISOString(),
          studentsCount:
            item.course
              ._count
              .students,
        })
      ) || []
    );
  } catch (error) {
    console.error(
      "Teacher Courses Error:",
      error
    );

    return [];
  }
}