"use server";


import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTeacherActivitiesProgressAction() {
  try {
    const session =
      await auth();

    if (!session?.user?.id) {
      return [];
    }

    const teacherId =
      session.user.id;

    const activities =
      await prisma.studentActivity.findMany(
        {
          where: {
            course: {
              teachers: {
                some: {
                  teacherId,
                },
              },
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,

                students: {
                  select: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        studentCode: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

    return activities.map(
      (activity) => ({
        id: activity.id,
        title:
          activity.title,
        type: activity.type,
        points:
          activity.points,

        dueDate:
          activity.dueDate?.toISOString() ||
          null,

        createdAt:
          activity.createdAt.toISOString(),

        course: {
          id: activity.course.id,
          name:
            activity.course.name,
          code:
            activity.course.code,
        },

        students:
          activity.course.students.map(
            (
              item
            ) => ({
              id: item.student.id,
              name:
                item.student.name,
              code:
                item.student.studentCode,

              progress:
                Math.floor(
                  Math.random() *
                    101
                ),

              status:
                Math.random() >
                0.5
                  ? "DONE"
                  : "PENDING",
            })
          ),
      })
    );
  } catch (error) {
    console.error(
      error
    );

    return [];
  }
}