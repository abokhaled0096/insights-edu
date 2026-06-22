"use server";

// app/actions/teacher/get-available-activities.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAvailableActivitiesAction() {
  try {
    const session =
      await auth();

    if (!session?.user?.id) {
      return {
        stats: {
          total: 0,
          active: 0,
          overdue: 0,
          courses: 0,
        },
        activities: [],
      };
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

          orderBy: [
            {
              dueDate:
                "asc",
            },
            {
              createdAt:
                "desc",
            },
          ],

          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,

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
        }
      );

    const now =
      new Date();

    const mapped =
      activities.map(
        (item) => ({
          id: item.id,
          title: item.title,
          description:
            item.description,
          type: item.type,
          points:
            item.points,

          dueDate:
            item.dueDate?.toISOString() ||
            null,

          createdAt:
            item.createdAt.toISOString(),

          course: {
            id: item.course.id,
            name:
              item.course.name,
            code:
              item.course.code,
            students:
              item.course
                ._count
                .students,
          },

          overdue:
            item.dueDate
              ? item.dueDate <
                now
              : false,
        })
      );

    const uniqueCourses =
      new Set(
        mapped.map(
          (
            x
          ) =>
            x.course.id
        )
      );

    return {
      stats: {
        total:
          mapped.length,

        active:
          mapped.filter(
            (
              x
            ) =>
              !x.overdue
          ).length,

        overdue:
          mapped.filter(
            (
              x
            ) =>
              x.overdue
          ).length,

        courses:
          uniqueCourses.size,
      },

      activities:
        mapped,
    };
  } catch (error) {
    console.error(
      "Available Activities Error:",
      error
    );

    return {
      stats: {
        total: 0,
        active: 0,
        overdue: 0,
        courses: 0,
      },
      activities: [],
    };
  }
}