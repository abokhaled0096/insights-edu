/**
 * lib/insights.ts
 *
 * Pure statistical insight recalculation – NO AI involved.
 * Called from:
 *   - app/actions/teacher/exam/grade.ts  (on every grade save → instant propagation)
 *   - app/api/seed-risk/route.ts  (admin-triggered full refresh)
 *   - app/api/seed-realistic/route.ts (initial data seed)
 *
 * Zero-division guards on every rate calculation.
 */

import { prisma } from "@/lib/prisma";

export async function computeAndSaveInsight(studentId: string): Promise<void> {
  // ── Attendance rate ────────────────────────────────────────────────────────
  const [totalAtt, presentAtt] = await Promise.all([
    prisma.attendance.count({ where: { studentId } }),
    prisma.attendance.count({ where: { studentId, status: "PRESENT" } }),
  ]);
  const attendanceRate = totalAtt === 0
    ? 0
    : Math.round((presentAtt / totalAtt) * 100);

  // ── Average quiz score (only rows in ExamResult = "GRADED") ───────────────
  const results  = await prisma.examResult.findMany({
    where:  { studentId },
    select: { score: true },
  });
  const avgScore = results.length === 0
    ? 0
    : Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);

  // ── Assignment submission rate ─────────────────────────────────────────────
  const [totalSubs, doneSubs] = await Promise.all([
    prisma.assignmentSubmission.count({ where: { studentId } }),
    prisma.assignmentSubmission.count({
      where: { studentId, status: { in: ["SUBMITTED", "GRADED"] } },
    }),
  ]);
  const assignmentRate = totalSubs === 0
    ? 0
    : Math.round((doneSubs / totalSubs) * 100);

  // ── Risk classification ────────────────────────────────────────────────────
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (avgScore < 50 || attendanceRate < 50)      riskLevel = "HIGH";
  else if (avgScore < 70 || attendanceRate < 75) riskLevel = "MEDIUM";

  // ── Deterministic text corpus ──────────────────────────────────────────────
  const TEXTS = {
    HIGH: {
      summary:          "أداء ضعيف وغياب متكرر – يستدعي تدخلاً فورياً",
      predictedOutcome: "رسوب محتمل في عدة مواد",
      recommendations:  ["استدعاء ولي الأمر فوراً", "جلسة إرشاد أكاديمي عاجلة", "تكليفات تعويضية مكثّفة"],
      reasons:          ["نسبة حضور أقل من 50%", "متوسط درجات الكويزات أقل من 50%"],
    },
    MEDIUM: {
      summary:          "أداء متذبذب – يحتاج لمتابعة دورية",
      predictedOutcome: "نجاح بمعدل مقبول إذا تحسّن الأداء",
      recommendations:  ["تنبيه الطالب بأهمية الانتظام", "توفير مراجعات إضافية في المواد الصعبة"],
      reasons:          ["غياب متقطع", "درجات متوسطة في الكويزات الأخيرة"],
    },
    LOW: {
      summary:          "أداء جيد ومنتظم – يستحق التشجيع",
      predictedOutcome: "نجاح بتفوق",
      recommendations:  ["تشجيع المشاركة في المسابقات والأنشطة", "الحفاظ على مستوى الأداء الحالي"],
      reasons:          ["حضور منتظم عالٍ", "درجات مرتفعة في الكويزات"],
    },
  } as const;

  const t = TEXTS[riskLevel];

  // ── Persist (delete old + insert fresh) ───────────────────────────────────
  await prisma.studentInsight.deleteMany({ where: { studentId } });
  await prisma.studentInsight.create({
    data: {
      studentId,
      riskLevel,
      confidence:       riskLevel === "HIGH" ? 0.92 : riskLevel === "MEDIUM" ? 0.80 : 0.95,
      summary:          t.summary,
      predictedOutcome: t.predictedOutcome,
      recommendations:  t.recommendations,
      reasons:          t.reasons,
      attendanceRate,
      averageScore:     avgScore,
      assignmentRate,
      engagementScore:  Math.round((attendanceRate + assignmentRate) / 2),
      modelName:        "statistical",
      modelVersion:     "v1.0",
    },
  });
}
