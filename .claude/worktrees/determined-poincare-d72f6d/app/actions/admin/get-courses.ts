"use server";

// app/actions/admin/get-courses.ts

import { prisma } from "@/lib/prisma";

export async function getCoursesAction() {
  try {
    const courses =
      await prisma.course.findMany({
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          createdAt: true,

          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
      });

    return courses.map(
      (course) => ({
        id: course.id,
        name: course.name,
        code: course.code,
        description:
          course.description,

        createdAt:
          course.createdAt.toISOString(),

        studentsCount:
          course._count.students,

        teachersCount:
          course._count.teachers,
      })
    );
  } catch (error) {
    console.error(
      "Get Courses Error:",
      error
    );

    return [];
  }
}