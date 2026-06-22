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
      courseStats,
      atRiskStudents,
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

      // Per-course aggregate stats
      prisma.course.findMany({
        where: {
          teachers: { some: { teacherId } },
        },
        select: {
          id: true,
          name: true,
          code: true,
          attendances: { select: { status: true } },
          exams: {
            select: {
              results: { select: { score: true } },
            },
          },
          assignments: {
            select: {
              submissions: { select: { status: true, grade: true } },
            },
          },
          _count: { select: { students: true } },
        },
      }),

      prisma.user.findMany({
        where: {
          role: "STUDENT",
          enrollments: { some: { course: { teachers: { some: { teacherId } } } } },
          insights: { some: { riskLevel: "HIGH" } },
        },
        select: {
          id: true,
          name: true,
          email: true,
          insights: {
            orderBy: { generatedAt: "desc" },
            take: 1,
            select: { reasons: true, recommendations: true },
          },
          enrollments: {
            where: { course: { teachers: { some: { teacherId } } } },
            select: { course: { select: { name: true } } },
          },
        },
      }),
    ]);

    // Compute per-course aggregates
    const enrichedCourseStats = courseStats.map((c) => {
      const totalAtt = c.attendances.length;
      const presentAtt = c.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      const allScores = c.exams.flatMap((e) => e.results.map((r) => r.score));
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
        : 0;

      const allSubs = c.assignments.flatMap((a) => a.submissions);
      const gradedSubs = allSubs.filter((s) => s.status === "GRADED" || s.status === "SUBMITTED").length;
      const submissionRate = allSubs.length > 0 ? Math.round((gradedSubs / allSubs.length) * 100) : 0;

      const gradedWithScore = allSubs.filter((s) => s.grade !== null);
      const avgAssignmentGrade = gradedWithScore.length > 0
        ? Math.round(gradedWithScore.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedWithScore.length)
        : 0;

      return {
        id: c.id,
        name: c.name,
        code: c.code,
        studentsCount: c._count.students,
        attendanceRate,
        avgScore,
        submissionRate,
        avgAssignmentGrade,
      };
    });

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

      courseStats: enrichedCourseStats,

      atRiskStudents: atRiskStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        courses: s.enrollments.map((e) => e.course.name),
        aiReasons: s.insights[0]?.reasons as string[] || [],
        aiRecommendations: s.insights[0]?.recommendations as string[] || [],
      })),
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
      atRiskStudents: [],
    };
  }
}