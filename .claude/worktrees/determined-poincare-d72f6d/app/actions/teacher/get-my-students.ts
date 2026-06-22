"use server";

// app/actions/teacher/get-my-students.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getMyStudentsAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return [];
    }

    const students =
      await prisma.user.findMany({
        where: {
          role: "STUDENT",

          enrollments: {
            some: {
              course: {
                teachers: {
                  some: {
                    teacherId:
                      session
                        .user.id,
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          studentCode: true,
          createdAt: true,

          enrollments: {
            where: {
              course: {
                teachers: {
                  some: {
                    teacherId:
                      session
                        .user.id,
                  },
                },
              },
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
          },

          _count: {
            select: {
              attendances:
                true,
            },
          },
        },
      });

    return students.map(
      (student) => ({
        id: student.id,
        name: student.name,
        email:
          student.email,
        image:
          student.image,
        studentCode:
          student.studentCode,
        createdAt:
          student.createdAt.toISOString(),

        courses:
          student.enrollments.map(
            (
              item
            ) => ({
              id: item.course.id,
              name: item.course.name,
              code: item.course.code,
            })
          ),

        coursesCount:
          student
            .enrollments
            .length,

        attendancesCount:
          student
            ._count
            .attendances,
      })
    );
  } catch (error) {
    console.error(
      "Teacher Students Error:",
      error
    );

    return [];
  }
}