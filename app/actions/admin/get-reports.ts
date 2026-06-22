"use server";

// app/actions/admin/get-reports.ts

import { prisma } from "@/lib/prisma";

export async function getReportsAction() {
  try {
    const [
      studentsCount,
      teachersCount,
      coursesCount,
      attendanceCount,
      adminCount,
      latestStudents,
      latestTeachers,
      recentAttendances,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "STUDENT" },
      }),

      prisma.user.count({
        where: { role: "TEACHER" },
      }),

      prisma.course.count(),

      prisma.attendance.count(),

      prisma.user.count({
        where: { role: "ADMIN" },
      }),

      prisma.user.findMany({
        where: {
          role: "STUDENT",
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),

      prisma.user.findMany({
        where: {
          role: "TEACHER",
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),

      prisma.attendance.findMany({
        take: 5,
        orderBy: {
          date: "desc",
        },
        include: {
          student: {
            select: {
              name: true,
              studentCode: true,
            },
          },
          course: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        studentsCount,
        teachersCount,
        coursesCount,
        attendanceCount,
        adminCount,
      },

      latestStudents,

      latestTeachers,

      recentAttendances:
        recentAttendances.map(
          (item) => ({
            id: item.id,
            student:
              item.student
                ?.name ||
              "طالب",
            code:
              item.student
                ?.studentCode ||
              "-",
            course:
              item.course
                ?.name ||
              "-",
            // Serialize the raw Date to an ISO string before crossing the
            // server -> client boundary (required in Next.js 16).
            // Note: the Attendance model's timestamp field is `date`.
            createdAt:
              item.date?.toISOString() ??
              null,
          })
        ),
    };
  } catch (error) {
    console.error(
      "Reports Error:",
      error
    );

    return {
      stats: {
        studentsCount: 0,
        teachersCount: 0,
        coursesCount: 0,
        attendanceCount: 0,
        adminCount: 0,
      },
      latestStudents: [],
      latestTeachers: [],
      recentAttendances: [],
    };
  }
}