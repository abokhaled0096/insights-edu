"use server";

// app/actions/student/get-dashboard.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentDashboardAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        stats: {
          courses: 0,
          attendance: 0,
          exams: 0,
          assignments: 0,
        },
        courses: [],
        recentAttendance: [],
        exams: [],
      };
    }

    const studentId =
      session.user.id;

    const [
      enrollments,
      attendanceCount,
      examResultsCount,
      assignmentsCount,
      recentAttendance,
      upcomingAssignments,
    ] = await Promise.all([
      prisma.enrollment.findMany(
        {
          where: {
            studentId,
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

      prisma.attendance.count({
        where: {
          studentId,
          status:
            "PRESENT",
        },
      }),

      prisma.examResult.count({
        where: {
          studentId,
        },
      }),

      prisma.assignmentSubmission.count(
        {
          where: {
            studentId,
          },
        }
      ),

      prisma.attendance.findMany(
        {
          where: {
            studentId,
          },

          take: 8,

          orderBy: {
            date: "desc",
          },

          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        }
      ),

      prisma.assignment.findMany(
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

          take: 5,

          orderBy: {
            dueDate:
              "asc",
          },

          select: {
            id: true,
            title: true,
            dueDate: true,
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
          enrollments.length,

        attendance:
          attendanceCount,

        exams:
          examResultsCount,

        assignments:
          assignmentsCount,
      },

      courses:
        enrollments.map(
          (item) => ({
            id: item.course.id,
            name: item.course.name,
            code: item.course.code,
          })
        ),

      recentAttendance:
        recentAttendance.map(
          (item) => ({
            id: item.id,
            course:
              item.course
                ?.name ||
              "-",
            status:
              item.status,
            createdAt:
              item.date.toISOString(),
          })
        ),

      exams:
        upcomingAssignments.map(
          (item) => ({
            id: item.id,
            title:
              item.title,
            course:
              item.course
                .name,
            dueDate:
              item.dueDate.toISOString(),
          })
        ),
    };
  } catch (error) {
    console.error(
      "Student Dashboard Error:",
      error
    );

    return {
      stats: {
        courses: 0,
        attendance: 0,
        exams: 0,
        assignments: 0,
      },
      courses: [],
      recentAttendance: [],
      exams: [],
    };
  }
}