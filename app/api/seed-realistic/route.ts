/**
 * app/api/seed-realistic/route.ts
 *
 * Admin-only HTTP endpoint to run the realistic seed:
 *   GET /api/seed-realistic
 *
 * Creates 3 courses × 3 quizzes + 9 deterministic student profiles
 * with realistic Upcoming / Pending / Graded quiz states.
 * All StudentInsight records are computed statistically (zero-division guarded).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import { computeAndSaveInsight } from "@/lib/insights";

// ── helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// ── course catalogue ──────────────────────────────────────────────────────────
const COURSE_DEFS = [
  { code: "CS-EXPERT", name: "نظم خبيرة",                           description: "مقرر النظم الخبيرة وتطبيقاتها" },
  { code: "AI-EDU",    name: "تطبيقات الذكاء الاصطناعي في التعليم", description: "تطبيقات AI في المجال التعليمي" },
  { code: "NET-SEC",   name: "أمن الشبكات",                          description: "مقرر أمن الشبكات والمعلومات" },
] as const;

// ── student profiles ──────────────────────────────────────────────────────────
interface StudentProfile {
  name: string; email: string; code: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  attendancePct: number; // 0-1
  quiz1Score: number;    // out of 100
}

const STUDENT_PROFILES: StudentProfile[] = [
  // HIGH risk
  { name: "محمد سامي",    email: "s001@insightsedu.com", code: "S001", risk: "HIGH",   attendancePct: 0.38, quiz1Score: 35 },
  { name: "ليلى حسن",     email: "s002@insightsedu.com", code: "S002", risk: "HIGH",   attendancePct: 0.42, quiz1Score: 42 },
  { name: "أحمد فاروق",   email: "s003@insightsedu.com", code: "S003", risk: "HIGH",   attendancePct: 0.45, quiz1Score: 38 },
  // MEDIUM risk
  { name: "سارة خالد",    email: "s004@insightsedu.com", code: "S004", risk: "MEDIUM", attendancePct: 0.65, quiz1Score: 62 },
  { name: "يوسف منصور",   email: "s005@insightsedu.com", code: "S005", risk: "MEDIUM", attendancePct: 0.70, quiz1Score: 67 },
  { name: "هنا الشريف",   email: "s006@insightsedu.com", code: "S006", risk: "MEDIUM", attendancePct: 0.72, quiz1Score: 65 },
  // LOW risk
  { name: "نور عبد الله", email: "s007@insightsedu.com", code: "S007", risk: "LOW",    attendancePct: 0.90, quiz1Score: 88 },
  { name: "كريم إبراهيم", email: "s008@insightsedu.com", code: "S008", risk: "LOW",    attendancePct: 0.92, quiz1Score: 91 },
  { name: "منى حمدي",     email: "s009@insightsedu.com", code: "S009", risk: "LOW",    attendancePct: 0.95, quiz1Score: 95 },
];

const SESSIONS_PER_COURSE = 20;

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const log: string[] = [];
    const pw       = await bcrypt.hash("123456",    10);
    const strongPw = await bcrypt.hash("Admin@2026", 10);

    // 1. Staff users ───────────────────────────────────────────────────────────
    const teacher = await prisma.user.upsert({
      where:  { email: "teacher@insightsedu.com" },
      update: { password: pw, requirePasswordChange: false },
      create: { name: "د. علاء الدين حسن", email: "teacher@insightsedu.com", password: pw, role: "TEACHER", requirePasswordChange: false, emailVerified: new Date() },
    });
    await prisma.user.upsert({
      where: { email: "admin@insightsedu.com" },
      update: { password: strongPw, requirePasswordChange: false },
      create: { name: "مسؤول النظام", email: "admin@insightsedu.com", password: strongPw, role: "ADMIN", requirePasswordChange: false, emailVerified: new Date() },
    });
    const advisor = await prisma.user.upsert({
      where: { email: "advisor@insightsedu.com" },
      update: { password: pw, requirePasswordChange: false },
      create: { name: "د. أحمد المرشد", email: "advisor@insightsedu.com", password: pw, role: "ADVISOR", requirePasswordChange: false, emailVerified: new Date() },
    });
    await prisma.user.upsert({
      where: { email: "ta@insightsedu.com" },
      update: { password: pw, requirePasswordChange: false },
      create: { name: "سارة المعيدة", email: "ta@insightsedu.com", password: pw, role: "TA", requirePasswordChange: false, emailVerified: new Date() },
    });
    // backward-compat seed teacher
    const seedTeacher = await prisma.user.upsert({
      where: { email: "seed.teacher@edu.com" },
      update: {},
      create: { name: "د. محمد السيد", email: "seed.teacher@edu.com", password: pw, role: "TEACHER" },
    });
    log.push("✅ Staff users ready");

    // 2. Courses ───────────────────────────────────────────────────────────────
    const courseIds: Record<string, string> = {};
    for (const def of COURSE_DEFS) {
      const c = await prisma.course.upsert({ where: { code: def.code }, update: { name: def.name, description: def.description }, create: { ...def } });
      courseIds[def.code] = c.id;
      for (const tid of [teacher.id, seedTeacher.id]) {
        await prisma.teacherCourse.upsert({ where: { teacherId_courseId: { teacherId: tid, courseId: c.id } }, update: {}, create: { teacherId: tid, courseId: c.id } });
      }
    }
    log.push("✅ 3 courses ready");

    // 3. Quizzes (stable IDs prevent duplicates on re-run) ─────────────────────
    const quizMeta: Record<string, Array<{ examId: string; isUpcoming: boolean }>> = {};
    for (const def of COURSE_DEFS) {
      const cId = courseIds[def.code];
      quizMeta[def.code] = [];
      const quizDefs = [
        { idx: 1, label: `كويز 1 – المفاهيم الأساسية (${def.name})`,  isUpcoming: false },
        { idx: 2, label: `كويز 2 – التطبيقات العملية (${def.name})`,  isUpcoming: false },
        { idx: 3, label: `كويز 3 – مراجعة شاملة (${def.name})`,       isUpcoming: true  },
      ];
      for (const qd of quizDefs) {
        const stableId = `quiz-${def.code}-${qd.idx}`;
        const exam = await prisma.exam.upsert({ where: { id: stableId }, update: { title: qd.label }, create: { id: stableId, title: qd.label, courseId: cId } });
        quizMeta[def.code].push({ examId: exam.id, isUpcoming: qd.isUpcoming });
      }
    }
    log.push("✅ 9 quizzes ready (Quiz 3 = upcoming for all)");

    // 4. Students ──────────────────────────────────────────────────────────────
    for (const profile of STUDENT_PROFILES) {
      const student = await prisma.user.upsert({
        where:  { email: profile.email },
        update: { password: pw, requirePasswordChange: false, studentCode: profile.code },
        create: { name: profile.name, email: profile.email, password: pw, role: "STUDENT", studentCode: profile.code, requirePasswordChange: false, emailVerified: new Date() },
      });

      for (const def of COURSE_DEFS) {
        const cId = courseIds[def.code];

        // Enrollment
        await prisma.enrollment.upsert({ where: { studentId_courseId: { studentId: student.id, courseId: cId } }, update: {}, create: { studentId: student.id, courseId: cId } });

        // Attendance – deterministic
        const presentCount = Math.round(profile.attendancePct * SESSIONS_PER_COURSE);
        await prisma.attendance.deleteMany({ where: { studentId: student.id, courseId: cId } });
        for (let s = 0; s < SESSIONS_PER_COURSE; s++) {
          await prisma.attendance.create({ data: { studentId: student.id, courseId: cId, status: s < presentCount ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, date: daysAgo(SESSIONS_PER_COURSE - s) } });
        }

        // Quiz results
        const quizzes = quizMeta[def.code];
        for (let qi = 0; qi < quizzes.length; qi++) {
          const q = quizzes[qi];
          if (q.isUpcoming) continue;                                           // Quiz 3: UPCOMING
          if (qi === 1 && profile.risk === "HIGH") continue;                    // Quiz 2 HIGH: PENDING
          if (qi === 1 && profile.email === "s004@insightsedu.com") continue;  // s004 Quiz 2: PENDING

          const courseBonus = def.code === "AI-EDU" ? 3 : def.code === "NET-SEC" ? -2 : 0;
          const quizPenalty = qi === 0 ? 0 : -5;
          const score = Math.max(0, Math.min(100, profile.quiz1Score + courseBonus + quizPenalty));

          await prisma.examResult.upsert({
            where:  { examId_studentId: { examId: q.examId, studentId: student.id } },
            update: { score },
            create: { examId: q.examId, studentId: student.id, score },
          });
        }
      }

      // Statistical insight (zero-division guarded)
      await computeAndSaveInsight(student.id);
      log.push(`  ↳ ${profile.name} [${profile.risk}]`);
    }
    log.push("✅ 9 students seeded with realistic data");

    // 5. Advisor warnings ──────────────────────────────────────────────────────
    const highRisk = await prisma.user.findMany({ where: { role: "STUDENT", insights: { some: { riskLevel: "HIGH" } } }, select: { id: true, name: true } });
    for (const s of highRisk) {
      const exists = await prisma.advisorRecommendation.findFirst({ where: { advisorId: advisor.id, studentId: s.id } });
      if (!exists) {
        await prisma.advisorRecommendation.create({ data: { advisorId: advisor.id, studentId: s.id, text: `الطالب ${s.name ?? ""} يسجّل غياباً متكرراً وضعفاً في الكويزات. يُوصى بعقد جلسة إرشاد أكاديمي عاجلة.`, isWarning: true } });
      }
    }

    log.push("🎉 Realistic seed complete!");
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
