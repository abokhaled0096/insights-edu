"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateStudentInsight(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      examResults: true,
      attendances: true,
      submissions: true,
      activitySubmissions: true,
    },
  });

  if (!student) {
    return { success: false };
  }

  const totalExams = student.examResults.length;

  const avgScore =
    totalExams === 0
      ? 0
      : student.examResults.reduce(
          (sum, e) => sum + e.score,
          0
        ) / totalExams;

  const attendanceRate =
    student.attendances.length === 0
      ? 0
      : (
          student.attendances.filter(
            (a) => a.status === "PRESENT"
          ).length /
          student.attendances.length
        ) * 100;

  const assignmentRate =
    student.submissions.length === 0
      ? 0
      : (
          student.submissions.filter(
            (s) => s.status === "SUBMITTED" ||
                   s.status === "GRADED"
          ).length /
          student.submissions.length
        ) * 100;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Analyze this student academically.

Average Score: ${avgScore}
Attendance Rate: ${attendanceRate}
Assignment Completion: ${assignmentRate}

Return JSON only:

{
  "riskLevel":"LOW",
  "confidence":0.91,
  "summary":"Student is stable.",
  "predictedOutcome":"Likely Pass",
  "recommendations":[
    "Keep consistency",
    "Improve exam speed"
  ],
  "reasons":[
    "Good attendance",
    "Strong scores"
  ]
}
`,
    });

  const parsed = JSON.parse(response.text || "{}");

  await prisma.studentInsight.create({
    data: {
      studentId,
      riskLevel: parsed.riskLevel,
      confidence: parsed.confidence,
      summary: parsed.summary,
      predictedOutcome: parsed.predictedOutcome,
      recommendations: parsed.recommendations,
      reasons: parsed.reasons,
      attendanceRate,
      averageScore: avgScore,
      assignmentRate,
      engagementScore: 80,
      modelName: "gemini",
      modelVersion: "2.5-flash",
    },
  });

  return {
    success: true,
    data: parsed,
  };
}