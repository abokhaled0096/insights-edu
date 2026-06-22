"use server";

// app/actions/student/get-activities.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentActivitiesAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
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

    const studentId =
      session.user.id;

    const activities =
      await prisma.studentActivity.findMany(
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
              },
            },
          },
        }
      );

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
          },
        })
      );

    return {
      activities:
        mapped,

      stats: {
        total:
          mapped.length,

        tasks:
          mapped.filter(
            (
              x
            ) =>
              x.type ===
              "TASK"
          ).length,

        quizzes:
          mapped.filter(
            (
              x
            ) =>
              x.type ===
              "QUIZ"
          ).length,

        projects:
          mapped.filter(
            (
              x
            ) =>
              x.type ===
              "PROJECT"
          ).length,

        exams:
          mapped.filter(
            (
              x
            ) =>
              x.type ===
              "EXAM"
          ).length,

        events:
          mapped.filter(
            (
              x
            ) =>
              x.type ===
              "EVENT"
          ).length,
      },
    };
  } catch (error) {
    console.error(
      "Student Activities Error:",
      error
    );

    return {
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