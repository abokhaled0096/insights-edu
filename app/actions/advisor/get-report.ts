"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdvisorReportAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") return { students: [], stats: { total: 0, avgAttendance: 0, avgScore: 0, atRisk: 0, warnings: 0 } };

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        attendances: true,
        examResults: true,
        insights: { orderBy: { generatedAt: "desc" }, take: 1 },
        advisorRecommendationsReceived: { where: { advisorId: session.user.id, isWarning: true } },
      },
      orderBy: { name: "asc" },
    });

    const studentReport = students.map((s) => {
      const totalA = s.attendances.length;
      const presentA = s.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalA > 0 ? Math.round((presentA / totalA) * 100) : 0;

      const scores = s.examResults.map((r) => r.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const riskLevel = s.insights[0]?.riskLevel || null;
      const warningsCount = s.advisorRecommendationsReceived.length;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        studentCode: s.studentCode,
        attendanceRate,
        avgScore,
        riskLevel,
        warningsCount,
      };
    });

    const totalAttRates = studentReport.map((s) => s.attendanceRate);
    const totalScores = studentReport.map((s) => s.avgScore);
    const atRisk = studentReport.filter((s) => s.riskLevel === "HIGH").length;
    const totalWarnings = studentReport.reduce((sum, s) => sum + s.warningsCount, 0);

    return {
      students: studentReport,
      stats: {
        total: students.length,
        avgAttendance: totalAttRates.length > 0 ? Math.round(totalAttRates.reduce((a, b) => a + b, 0) / totalAttRates.length) : 0,
        avgScore: totalScores.length > 0 ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0,
        atRisk,
        warnings: totalWarnings,
      },
    };
  } catch (error) {
    console.error("Get Advisor Report Error:", error);
    return { students: [], stats: { total: 0, avgAttendance: 0, avgScore: 0, atRisk: 0, warnings: 0 } };
  }
}
