"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getQualityReportsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { coursePerformance: [], teacherPerformance: [], earlyInterventions: [], overallStats: { avgAttendance: 0, avgScore: 0, atRiskStudents: 0, totalStudents: 0, totalCourses: 0 } };
    }

    // Get all courses with stats
    const courses = await prisma.course.findMany({
      include: {
        students: true,
        teachers: { include: { teacher: { select: { name: true } } } },
        attendances: true,
        exams: { include: { results: true } },
        assignments: { include: { submissions: true } },
      },
    });

    const coursePerformance = courses.map((course) => {
      const totalStudents = course.students.length;
      const totalAttendances = course.attendances.length;
      const presentCount = course.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

      const allScores = course.exams.flatMap((e) => e.results.map((r) => r.score));
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

      const totalSubmissions = course.assignments.flatMap((a) => a.submissions).length;
      const expectedSubmissions = course.assignments.length * totalStudents;
      const submissionRate = expectedSubmissions > 0 ? Math.round((totalSubmissions / expectedSubmissions) * 100) : 0;

      const teacherNames = course.teachers.map((t) => t.teacher.name || "بدون اسم").join(", ");

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        teacherNames,
        studentsCount: totalStudents,
        attendanceRate,
        avgScore,
        submissionRate,
      };
    });

    // Get teacher performance
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        teachings: true,
        teacherAssignment: true,
      },
    });

    const teacherPerformance = await Promise.all(
      teachers.map(async (teacher) => {
        const courseCount = teacher.teachings.length;
        const assignmentCount = teacher.teacherAssignment.length;
        const courseIds = teacher.teachings.map((t) => t.courseId);

        const examCount = await prisma.exam.count({ where: { courseId: { in: courseIds } } });
        const activityCount = await prisma.studentActivity.count({ where: { courseId: { in: courseIds } } });

        return {
          id: teacher.id,
          name: teacher.name || "بدون اسم",
          email: teacher.email,
          courseCount,
          examCount,
          assignmentCount,
          activityCount,
        };
      })
    );

    // At-risk students
    const atRiskStudents = await prisma.studentInsight.count({
      where: { riskLevel: "HIGH" },
    });

    const atRiskStudentsData = await prisma.user.findMany({
      where: { role: "STUDENT", insights: { some: { riskLevel: "HIGH" } } },
      select: {
        id: true,
        name: true,
        email: true,
        insights: { orderBy: { generatedAt: "desc" }, take: 1, select: { reasons: true, recommendations: true, predictedOutcome: true } }
      }
    });

    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });

    const allAttendances = await prisma.attendance.count();
    const presentAttendances = await prisma.attendance.count({ where: { status: "PRESENT" } });
    const avgAttendance = allAttendances > 0 ? Math.round((presentAttendances / allAttendances) * 100) : 0;

    const allResults = await prisma.examResult.findMany({ select: { score: true } });
    const avgScore = allResults.length > 0 ? Math.round(allResults.reduce((a, b) => a + b.score, 0) / allResults.length) : 0;

    return {
      coursePerformance,
      teacherPerformance,
      earlyInterventions: atRiskStudentsData.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        aiReasons: s.insights[0]?.reasons as string[] || [],
        aiRecommendations: s.insights[0]?.recommendations as string[] || [],
        predictedOutcome: s.insights[0]?.predictedOutcome || "غير محدد"
      })),
      overallStats: {
        avgAttendance,
        avgScore,
        atRiskStudents,
        totalStudents,
        totalCourses: courses.length,
      },
    };
  } catch (error) {
    console.error("Quality Reports Error:", error);
    return {
      coursePerformance: [],
      teacherPerformance: [],
      earlyInterventions: [],
      overallStats: { avgAttendance: 0, avgScore: 0, atRiskStudents: 0, totalStudents: 0, totalCourses: 0 },
    };
  }
}
