"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdvisorDashboardAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") {
      return { students: [], recommendations: [], meetings: [], stats: { students: 0, warnings: 0, meetings: 0, pendingMeetings: 0 } };
    }
    const advisorId = session.user.id;
    const [students, recommendations, meetings] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true, name: true, email: true, studentCode: true,
          attendances: { select: { status: true } },
          examResults: { select: { score: true } },
          submissions: { select: { status: true } },
        },
        take: 50, orderBy: { name: "asc" },
      }),
      prisma.advisorRecommendation.findMany({
        where: { advisorId },
        include: { student: { select: { name: true } } },
        orderBy: { createdAt: "desc" }, take: 20,
      }),
      prisma.advisorMeeting.findMany({
        where: { advisorId },
        include: { student: { select: { name: true } } },
        orderBy: { meetingDate: "desc" }, take: 20,
      }),
    ]);
    const warningCount = await prisma.advisorRecommendation.count({ where: { advisorId, isWarning: true } });
    const pendingMeetings = await prisma.advisorMeeting.count({ where: { advisorId, status: "SCHEDULED" } });
    const enrichedStudents = students.map((s) => {
      const total = s.attendances.length;
      const present = s.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
      const avgScore = s.examResults.length > 0 ? Math.round(s.examResults.reduce((sum, e) => sum + e.score, 0) / s.examResults.length) : 0;
      const submitted = s.submissions.filter((sub) => sub.status === "SUBMITTED" || sub.status === "GRADED").length;
      const assignmentRate = s.submissions.length > 0 ? Math.round((submitted / s.submissions.length) * 100) : 0;
      return { id: s.id, name: s.name, email: s.email, studentCode: s.studentCode, attendanceRate, avgScore, assignmentRate };
    });
    // Per-course aggregate stats for the 3 seeded courses
    const targetCodes = ["CS-EXPERT", "AI-EDU", "NET-SEC"];
    const courseAggregates = await prisma.course.findMany({
      where: { code: { in: targetCodes } },
      select: {
        id: true, name: true, code: true,
        attendances: { select: { status: true } },
        exams: { select: { results: { select: { score: true } } } },
        assignments: { select: { submissions: { select: { status: true, grade: true } } } },
        _count: { select: { students: true } },
      },
    });

    const courseStats = courseAggregates.map((c) => {
      const totalAtt = c.attendances.length;
      const presentAtt = c.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;
      const allScores = c.exams.flatMap((e) => e.results.map((r) => r.score));
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;
      const allSubs = c.assignments.flatMap((a) => a.submissions);
      const gradedSubs = allSubs.filter((s) => s.status === "GRADED" || s.status === "SUBMITTED").length;
      const submissionRate = allSubs.length > 0 ? Math.round((gradedSubs / allSubs.length) * 100) : 0;
      return { id: c.id, name: c.name, code: c.code, studentsCount: c._count.students, attendanceRate, avgScore, submissionRate };
    });

    return {
      students: enrichedStudents,
      recommendations: recommendations.map((r) => ({ id: r.id, studentName: r.student.name, text: r.text, isWarning: r.isWarning, createdAt: r.createdAt.toISOString() })),
      meetings: meetings.map((m) => ({ id: m.id, studentName: m.student.name, studentId: m.studentId, meetingDate: m.meetingDate.toISOString(), notes: m.notes, status: m.status, createdAt: m.createdAt.toISOString() })),
      stats: { students: students.length, warnings: warningCount, meetings: meetings.length, pendingMeetings },
      courseStats,
    };
  } catch (error) {
    console.error("Advisor Dashboard Error:", error);
    return { students: [], recommendations: [], meetings: [], stats: { students: 0, warnings: 0, meetings: 0, pendingMeetings: 0 } };
  }
}
