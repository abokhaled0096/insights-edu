"use server";

// app/actions/teacher/get-activities.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTeacherActivitiesAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        courses: [],
        activities: [],
        stats: {
          total: 0,
          tasks: 0,
          quizzes: 0,
          projects: 0,
          exams: 0,
          events: 0,
        },
      };
    }

    const teacherId =
      session.user.id;

    const [
      teacherCourses,
      activities,
    ] = await Promise.all([
      prisma.teacherCourse.findMany(
        {
          where: {
            teacherId,
          },

          select: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        }
      ),

      prisma.studentActivity.findMany(
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
      ),
    ]);

    const mappedCourses =
      teacherCourses.map(
        (item) => ({
          id: item.course.id,
          name: item.course.name,
          code: item.course.code,
        })
      );

    const mappedActivities =
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
        })
      );

    const stats = {
      total:
        mappedActivities.length,

      tasks:
        mappedActivities.filter(
          (
            x
          ) =>
            x.type ===
            "TASK"
        ).length,

      quizzes:
        mappedActivities.filter(
          (
            x
          ) =>
            x.type ===
            "QUIZ"
        ).length,

      projects:
        mappedActivities.filter(
          (
            x
          ) =>
            x.type ===
            "PROJECT"
        ).length,

      exams:
        mappedActivities.filter(
          (
            x
          ) =>
            x.type ===
            "EXAM"
        ).length,

      events:
        mappedActivities.filter(
          (
            x
          ) =>
            x.type ===
            "EVENT"
        ).length,
    };

    return {
      courses:
        mappedCourses,
      activities:
        mappedActivities,
      stats,
    };
  } catch (error) {
    console.error(
      "Teacher Activities Error:",
      error
    );

    return {
      courses: [],
      activities: [],
      stats: {
        total: 0,
        tasks: 0,
        quizzes: 0,
        projects: 0,
        exams: 0,
        events: 0,
      },
    };
  }
}