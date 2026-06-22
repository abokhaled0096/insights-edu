import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Courses ────────────────────────────────────────────────────────────────

const COURSES = [
  { code: 'CS-EXPERT', name: 'نظم خبيره',                              description: 'مقرر النظم الخبيرة وتطبيقاتها' },
  { code: 'AI-EDU',   name: 'تطبيقات الذكاء الاصطناعي في التعليم',    description: 'تطبيقات AI في المجال التعليمي' },
  { code: 'NET-SEC',  name: 'أمن الشبكات',                             description: 'مقرر أمن الشبكات والمعلومات' },
];

// ─── 25 Mock Students ────────────────────────────────────────────────────────

const STUDENTS = [
  { name: 'أحمد محمد علي',       email: 'ahmed.ali@student.edu',       code: '1A2B3C4D' },
  { name: 'فاطمة حسن إبراهيم',   email: 'fatima.hassan@student.edu',   code: '2B3C4D5E' },
  { name: 'محمد عبدالله سالم',   email: 'mohamed.salem@student.edu',   code: '3C4D5E6F' },
  { name: 'نور الدين يوسف',      email: 'nour.youssef@student.edu',    code: '4D5E6F7A' },
  { name: 'سارة خالد منصور',     email: 'sara.mansour@student.edu',    code: '5E6F7A8B' },
  { name: 'عمر طارق الشريف',     email: 'omar.sharif@student.edu',     code: '6F7A8B9C' },
  { name: 'ريم أحمد الزهراني',   email: 'reem.zahrani@student.edu',    code: '7A8B9C0D' },
  { name: 'خالد إبراهيم النجار', email: 'khaled.najjar@student.edu',   code: '8B9C0D1E' },
  { name: 'منى سعيد الغامدي',    email: 'mona.ghamdi@student.edu',     code: '9C0D1E2F' },
  { name: 'يوسف علي الحربي',     email: 'youssef.harbi@student.edu',   code: '0D1E2F3A' },
  { name: 'لمياء محمد القحطاني', email: 'lamia.qahtani@student.edu',   code: 'A1B2C3D4' },
  { name: 'عبدالرحمن فهد العتيبي', email: 'abdulrahman.otaibi@student.edu', code: 'B2C3D4E5' },
  { name: 'هند عبدالعزيز الدوسري', email: 'hind.dosari@student.edu',   code: 'C3D4E5F6' },
  { name: 'تركي سلطان المطيري',  email: 'turki.mutairi@student.edu',   code: 'D4E5F6A7' },
  { name: 'أسماء ناصر الشمري',   email: 'asma.shamri@student.edu',     code: 'E5F6A7B8' },
  { name: 'بدر محمد الرشيدي',    email: 'badr.rashidi@student.edu',    code: 'F6A7B8C9' },
  { name: 'غادة عمر الزهراني',   email: 'ghada.zahrani@student.edu',   code: 'A7B8C9D0' },
  { name: 'وليد حسين العنزي',    email: 'walid.anazi@student.edu',     code: 'B8C9D0E1' },
  { name: 'شيماء أحمد البلوي',   email: 'shaimaa.balawi@student.edu',  code: 'C9D0E1F2' },
  { name: 'ماجد سعد الثبيتي',    email: 'majed.thubaiti@student.edu',  code: 'D0E1F2A3' },
  { name: 'رنا خالد الجهني',     email: 'rana.juhani@student.edu',     code: 'E1F2A3B4' },
  { name: 'فيصل عبدالله العسيري', email: 'faisal.asiri@student.edu',   code: 'F2A3B4C5' },
  { name: 'دانة محمد السبيعي',   email: 'dana.subaie@student.edu',     code: 'A3B4C5D6' },
  { name: 'حمد علي الشهري',      email: 'hamad.shahri@student.edu',    code: 'B4C5D6E7' },
  { name: 'نوف سلطان الحارثي',   email: 'nouf.harthi@student.edu',     code: 'C5D6E7F8' },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Upsert courses
  console.log('Seeding courses...');
  const courseRecords: Record<string, string> = {};
  for (const c of COURSES) {
    const record = await prisma.course.upsert({
      where: { code: c.code },
      update: { name: c.name, description: c.description },
      create: c,
    });
    courseRecords[c.code] = record.id;
    console.log(`  ✓ ${c.code} — ${c.name}`);
  }

  // 2. Upsert students
  console.log('\nSeeding 25 students...');
  const studentIds: string[] = [];
  for (const s of STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, studentCode: s.code },
      create: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'STUDENT',
        studentCode: s.code,
      },
    });
    studentIds.push(user.id);
    console.log(`  ✓ ${s.name} (${s.code})`);
  }

  // 3. Distribute students across courses
  // CS-EXPERT: students 0-9 (10 students)
  // AI-EDU:    students 8-18 (11 students, overlap intentional)
  // NET-SEC:   students 15-24 (10 students)
  const distribution: Record<string, number[]> = {
    'CS-EXPERT': [0,1,2,3,4,5,6,7,8,9],
    'AI-EDU':    [8,9,10,11,12,13,14,15,16,17,18],
    'NET-SEC':   [15,16,17,18,19,20,21,22,23,24],
  };

  console.log('\nEnrolling students...');
  for (const [code, indices] of Object.entries(distribution)) {
    const courseId = courseRecords[code];
    for (const idx of indices) {
      await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: studentIds[idx], courseId } },
        update: {},
        create: { studentId: studentIds[idx], courseId },
      });
    }
    console.log(`  ✓ ${code}: ${indices.length} students enrolled`);
  }

  // 4. Seed Exams + ExamResults per course
  console.log('\nSeeding exams and results...');
  const examTitles: Record<string, string[]> = {
    'CS-EXPERT': ['امتحان منتصف الفصل — نظم خبيره', 'امتحان نهاية الفصل — نظم خبيره'],
    'AI-EDU':    ['اختبار الوحدة الأولى — AI', 'امتحان نهاية الفصل — AI'],
    'NET-SEC':   ['اختبار أمن الشبكات الأول', 'امتحان نهاية الفصل — أمن الشبكات'],
  };

  // Score profiles per course to create realistic variance
  const scoreProfiles: Record<string, number[][]> = {
    'CS-EXPERT': [
      [88,72,91,65,55,78,83,47,95,60],   // exam 1
      [85,70,88,62,50,75,80,44,92,58],   // exam 2
    ],
    'AI-EDU': [
      [90,82,76,68,55,93,71,85,60,78,88],
      [87,79,73,65,52,90,68,82,57,75,85],
    ],
    'NET-SEC': [
      [70,85,92,58,45,77,88,63,95,50],
      [68,82,89,55,42,74,85,60,92,47],
    ],
  };

  for (const [code, titles] of Object.entries(examTitles)) {
    const courseId = courseRecords[code];
    const indices = distribution[code];
    for (let ei = 0; ei < titles.length; ei++) {
      const exam = await prisma.exam.upsert({
        where: { id: `seed-exam-${code}-${ei}` },
        update: { title: titles[ei] },
        create: { id: `seed-exam-${code}-${ei}`, title: titles[ei], courseId },
      });
      const scores = scoreProfiles[code][ei];
      for (let si = 0; si < indices.length; si++) {
        const studentId = studentIds[indices[si]];
        const score = scores[si] ?? rand(45, 95);
        await prisma.examResult.upsert({
          where: { examId_studentId: { examId: exam.id, studentId } },
          update: { score },
          create: { examId: exam.id, studentId, score },
        });
      }
    }
    console.log(`  ✓ ${code}: ${titles.length} exams seeded`);
  }

  // 5. Seed Attendance Sessions + Records
  console.log('\nSeeding attendance sessions and records...');
  // 8 sessions per course spread over last 60 days
  const sessionDays = [55, 48, 41, 34, 27, 20, 13, 6];

  for (const [code, days] of Object.entries({ 'CS-EXPERT': sessionDays, 'AI-EDU': sessionDays, 'NET-SEC': sessionDays })) {
    const courseId = courseRecords[code];
    const indices = distribution[code];
    for (const dayOffset of days) {
      const sessionDate = daysAgo(dayOffset);
      const sessionId = `seed-session-${code}-${dayOffset}`;
      await prisma.attendanceSession.upsert({
        where: { id: sessionId },
        update: {},
        create: {
          id: sessionId,
          courseId,
          active: false,
          startedAt: sessionDate,
          endedAt: new Date(sessionDate.getTime() + 90 * 60 * 1000),
        },
      });

      for (const idx of indices) {
        const studentId = studentIds[idx];
        // ~80% attendance rate with some students having lower rates
        const isPresent = idx % 5 === 0
          ? Math.random() > 0.45   // weaker students ~55% present
          : Math.random() > 0.15;  // strong students ~85% present
        const attId = `seed-att-${code}-${dayOffset}-${idx}`;
        await prisma.attendance.upsert({
          where: { id: attId },
          update: {},
          create: {
            id: attId,
            studentId,
            courseId,
            sessionId,
            status: isPresent ? 'PRESENT' : 'ABSENT',
            date: sessionDate,
          },
        });
      }
    }
    console.log(`  ✓ ${code}: ${days.length} sessions × ${distribution[code].length} students`);
  }

  // 6. Seed Assignments + Submissions
  console.log('\nSeeding assignments and submissions...');
  const assignmentDefs: Record<string, { title: string; daysAgoVal: number }[]> = {
    'CS-EXPERT': [
      { title: 'تقرير: تصميم نظام خبير لتشخيص الأمراض', daysAgoVal: 50 },
      { title: 'مشروع: بناء قاعدة معرفة باستخدام Prolog', daysAgoVal: 25 },
    ],
    'AI-EDU': [
      { title: 'بحث: تطبيقات ChatGPT في الفصل الدراسي', daysAgoVal: 45 },
      { title: 'عرض تقديمي: أدوات AI للتقييم التكيفي', daysAgoVal: 20 },
    ],
    'NET-SEC': [
      { title: 'تقرير: تحليل هجوم Man-in-the-Middle', daysAgoVal: 40 },
      { title: 'مختبر: إعداد جدار حماية باستخدام pfSense', daysAgoVal: 15 },
    ],
  };

  // We need a teacher to own assignments — use a placeholder admin/teacher id
  // Find or create a seed teacher
  const seedTeacher = await prisma.user.upsert({
    where: { email: 'seed.teacher@edu.com' },
    update: {},
    create: {
      name: 'د. محمد السيد',
      email: 'seed.teacher@edu.com',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  for (const [code, defs] of Object.entries(assignmentDefs)) {
    const courseId = courseRecords[code];
    const indices = distribution[code];
    for (const def of defs) {
      const assignId = `seed-assign-${code}-${def.daysAgoVal}`;
      await prisma.assignment.upsert({
        where: { id: assignId },
        update: { title: def.title },
        create: {
          id: assignId,
          title: def.title,
          courseId,
          teacherId: seedTeacher.id,
          dueDate: daysAgo(def.daysAgoVal - 7),
        },
      });

      for (const idx of indices) {
        const studentId = studentIds[idx];
        const submId = `seed-sub-${code}-${def.daysAgoVal}-${idx}`;
        // ~75% submission rate; some graded, some pending
        const roll = Math.random();
        const status = roll < 0.10 ? 'PENDING' : roll < 0.20 ? 'LATE' : 'GRADED';
        const grade = status === 'GRADED' ? rand(50, 100) : null;
        await prisma.assignmentSubmission.upsert({
          where: { id: submId },
          update: {},
          create: {
            id: submId,
            assignmentId: assignId,
            studentId,
            status,
            grade,
            submittedAt: status !== 'PENDING' ? daysAgo(def.daysAgoVal - rand(1, 6)) : null,
          },
        });
      }
    }
    console.log(`  ✓ ${code}: ${defs.length} assignments seeded`);
  }

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
