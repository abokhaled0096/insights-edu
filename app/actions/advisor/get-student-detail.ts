"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentDetailAction(studentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") return null;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: { include: { course: { select: { name: true, code: true } } } },
        attendances: {
          include: { course: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 30,
        },
        examResults: {
          include: { exam: { select: { title: true, course: { select: { name: true } } } } },
          orderBy: { createdAt: "desc" },
        },
        submissions: {
          include: { assignment: { select: { title: true, course: { select: { name: true } } } } },
          orderBy: { submittedAt: "desc" },
          take: 20,
        },
        advisorRecommendationsReceived: {
          include: { advisor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        advisorMeetingsAsStudent: {
          include: { advisor: { select: { name: true } } },
          orderBy: { meetingDate: "desc" },
        },
        insights: { orderBy: { generatedAt: "desc" }, take: 1 },
      },
    });

    if (!student) return null;

    const totalAttendance = student.attendances.length;
    const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const scores = student.examResults.map((r) => r.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const latestInsight = student.insights[0];

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      studentCode: student.studentCode,
      attendanceRate,
      avgScore,
      riskLevel: latestInsight?.riskLevel || null,
      summary: latestInsight?.summary || null,
      predictedOutcome: latestInsight?.predictedOutcome || null,
      confidence: latestInsight?.confidence || null,
      aiReasons: latestInsight?.reasons as string[] || [],
      aiRecommendations: latestInsight?.recommendations as string[] || [],
      courses: student.enrollments.map((e) => ({ name: e.course.name, code: e.course.code })),
      attendances: student.attendances.map((a) => ({
        id: a.id,
        course: a.course.name,
        status: a.status,
        date: a.date.toISOString(),
      })),
      examResults: student.examResults.map((r) => ({
        id: r.id,
        examTitle: r.exam.title,
        courseName: r.exam.course.name,
        score: r.score,
        createdAt: r.createdAt.toISOString(),
      })),
      submissions: student.submissions.map((s) => ({
        id: s.id,
        title: s.assignment.title,
        courseName: s.assignment.course.name,
        status: s.status,
        grade: s.grade,
      })),
      recommendations: student.advisorRecommendationsReceived.map((r) => ({
        id: r.id,
        text: r.text,
        isWarning: r.isWarning,
        advisorName: r.advisor.name,
        createdAt: r.createdAt.toISOString(),
      })),
      meetings: student.advisorMeetingsAsStudent.map((m) => ({
        id: m.id,
        advisorName: m.advisor.name,
        meetingDate: m.meetingDate.toISOString(),
        notes: m.notes,
        status: m.status,
      })),
    };
  } catch (error) {
    console.error("Get Student Detail Error:", error);
    return null;
  }
}
