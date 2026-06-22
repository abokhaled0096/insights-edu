"use server";

import { prisma } from "@/lib/prisma";

export async function getCourseAction(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                studentCode: true,
              },
            },
          },
          orderBy: {
            student: {
              name: 'asc'
            }
          }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            exams: true,
            assignments: true,
            studentActivities: true,
          },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      createdAt: course.createdAt.toISOString(),
      studentsCount: course.students.length,
      teachersCount: course.teachers.length,
      examsCount: course._count.exams,
      assignmentsCount: course._count.assignments,
      activitiesCount: course._count.studentActivities,
      students: course.students.map((e) => ({
        id: e.student.id,
        name: e.student.name || "بدون اسم",
        email: e.student.email,
        image: e.student.image,
        studentCode: e.student.studentCode,
      })),
      teachers: course.teachers.map((t) => ({
        id: t.teacher.id,
        name: t.teacher.name || "بدون اسم",
        email: t.teacher.email,
      })),
    };
  } catch (error) {
    console.error("Get Course Error:", error);
    return null;
  }
}
