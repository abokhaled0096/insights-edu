"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";
import { computeAndSaveInsight } from "@/lib/insights";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function parseGeminiJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  return JSON.parse(cleaned.slice(first, last + 1));
}

export async function gradeExamPaperAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const examId = formData.get("examId") as string;
    const file = formData.get("image") as File;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!exam) {
      return {
        success: false,
        error: "Exam not found",
      };
    }

    const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);

    const buffer = Buffer.from(await file.arrayBuffer());

    const base64 = buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        },
        {
          text: `
You are grading an exam sheet image.

Exam title: ${exam.title}
Total Marks: ${totalMarks}
Return ONLY valid JSON.
Do not use markdown.
No explanation.
Return JSON only:

{
  "score": 8,
  "total": ${totalMarks},
  "feedback": "Student performed well..."
}
            `,
        },
      ],
    });

    const parsed = parseGeminiJson(response.text || "");
    console.log(parsed);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Failed to analyze paper",
    };
  }
}

export async function saveExamGradeAction(data: {
  examId: string;
  studentId: string;
  score: number;
  aiResponse: any;
}) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // 1. Persist the grade
    await prisma.examResult.upsert({
      where: {
        examId_studentId: {
          examId: data.examId,
          studentId: data.studentId,
        },
      },
      update: {
        score: data.score,
        rawOcrData: data.aiResponse,
      },
      create: {
        examId: data.examId,
        studentId: data.studentId,
        score: data.score,
        rawOcrData: data.aiResponse,
      },
    });

    // 2. ── DYNAMIC PROPAGATION ──────────────────────────────────────────────
    // Immediately recalculate the student's insight based on ALL real data.
    // This updates averageScore, attendanceRate, riskLevel, etc. in real-time
    // WITHOUT any AI API call, so there is no extra cost or latency.
    await computeAndSaveInsight(data.studentId);
    // ───────────────────────────────────────────────────────────────────────

    // 3. Revalidate all role portals so they reflect the new grade instantly
    revalidatePath(`/teacher/exams/${data.examId}/grade`);
    revalidatePath(`/teacher/students/${data.studentId}/insight`);
    revalidatePath(`/student`);
    revalidatePath(`/student/exams`);
    revalidatePath(`/advisor/students`);

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Failed to save grade",
    };
  }
}

