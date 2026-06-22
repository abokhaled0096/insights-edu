import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAndSaveInsight } from "@/lib/insights";

/**
 * GET /api/seed-risk
 * Admin-triggered: recalculates StudentInsight for ALL students
 * using real statistical data (zero-division guarded, no AI calls).
 */
export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where:  { role: "STUDENT" },
      select: { id: true, name: true },
    });

    if (students.length === 0) {
      return NextResponse.json({ message: "لا يوجد طلاب في النظام" });
    }

    const results: Array<{ name: string | null; id: string }> = [];

    for (const student of students) {
      await computeAndSaveInsight(student.id);
      results.push({ id: student.id, name: student.name });
    }

    return NextResponse.json({
      success: true,
      message: `تم إعادة حساب التحليلات لـ ${results.length} طالب`,
      students: results,
    });
  } catch (error) {
    console.error("seed-risk error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

