"use server";

// app/actions/admin/get-students.ts

import { prisma } from "@/lib/prisma";

export async function getStudentsAction() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        studentCode: true,
        createdAt: true,

        _count: {
          select: {
            enrollments: true,
            attendances: true,
          },
        },
      },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      image: student.image,
      studentCode:
        student.studentCode,
      createdAt:
        student.createdAt.toISOString(),

      coursesCount:
        student._count.enrollments,

      attendancesCount:
        student._count
          .attendances,
    }));
  } catch (error) {
    console.error(
      "Get Students Error:",
      error
    );

    return [];
  }
}