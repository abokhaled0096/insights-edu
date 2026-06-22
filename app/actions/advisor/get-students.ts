"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdvisorStudentsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") return [];

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        enrollments: true,
        attendances: true,
        examResults: true,
        submissions: true,
        insights: { orderBy: { generatedAt: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });

    return students.map((s) => {
      const totalAttendance = s.attendances.length;
      const presentCount = s.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      const scores = s.examResults.map((r) => r.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const totalSubs = s.submissions.length;
      const gradedSubs = s.submissions.filter((sub) => sub.status === "GRADED" || sub.status === "SUBMITTED").length;
      const assignmentRate = totalSubs > 0 ? Math.round((gradedSubs / totalSubs) * 100) : 0;

      const latestInsight = s.insights[0];

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        studentCode: s.studentCode,
        coursesCount: s.enrollments.length,
        attendanceRate,
        avgScore,
        assignmentRate,
        riskLevel: latestInsight?.riskLevel || null,
      };
    });
  } catch (error) {
    console.error("Get Advisor Students Error:", error);
    return [];
  }
}
