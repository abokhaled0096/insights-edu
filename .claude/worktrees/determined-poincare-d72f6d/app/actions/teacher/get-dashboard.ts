"use server";

// app/actions/teacher/get-dashboard.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTeacherDashboardAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        stats: {
          courses: 0,
          students: 0,
          todayAttendance: 0,
          activeSession: 0,
        },
        courses: [],
        recentAttendance: [],
      };
    }

    const teacherId =
      session.user.id;

    const todayStart =
      new Date();
    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const [
      teacherCourses,
      studentsCount,
      todayAttendance,
      activeSession,
      recentAttendance,
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

      prisma.user.count({
        where: {
          role: "STUDENT",

          enrollments: {
            some: {
              course: {
                teachers: {
                  some: {
                    teacherId,
                  },
                },
              },
            },
          },
        },
      }),

      prisma.attendance.count({
        where: {
          date: {
            gte: todayStart,
          },

          course: {
            teachers: {
              some: {
                teacherId,
              },
            },
          },
        },
      }),

      prisma.attendanceSession.count(
        {
          where: {
            course:{
              teachers: {
                some: {
                  teacherId,
                },
              },
            },
            active: true,
          },
        }
      ),

      prisma.attendance.findMany(
        {
          take: 8,

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
        }
      ),
    ]);

    return {
      stats: {
        courses:
          teacherCourses.length,

        students:
          studentsCount,

        todayAttendance,

        activeSession,
      },

      courses:
        teacherCourses.map(
          (item) => ({
            id: item.course.id,
            name: item.course.name,
            code: item.course.code,
            students:
              item.course
                ._count
                .students,
          })
        ),

      recentAttendance:
        recentAttendance.map(
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
            createdAt:
              item.date.toISOString(),
          })
        ),
    };
  } catch (error) {
    console.error(
      "Teacher Dashboard Error:",
      error
    );

    return {
      stats: {
        courses: 0,
        students: 0,
        todayAttendance: 0,
        activeSession: 0,
      },
      courses: [],
      recentAttendance: [],
    };
  }
}