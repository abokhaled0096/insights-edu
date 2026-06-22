import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pw = await bcrypt.hash("123456", 10);
  const strongPw = await bcrypt.hash("Admin@2026", 10);

  // 1. Fix all existing seeded users
  await prisma.user.updateMany({ data: { requirePasswordChange: false } });
  console.log("Fixed existing users: requirePasswordChange = false");

  // 2. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@insightsedu.com" },
    update: { password: strongPw, role: "ADMIN", requirePasswordChange: false },
    create: {
      name: "مسؤول النظام",
      email: "admin@insightsedu.com",
      password: strongPw,
      role: "ADMIN",
      requirePasswordChange: false,
      emailVerified: new Date(),
    },
  });
  console.log("Admin:", admin.email);

  // 3. Create TA
  const ta = await prisma.user.upsert({
    where: { email: "ta@insightsedu.com" },
    update: { password: pw, role: "TA", requirePasswordChange: false },
    create: {
      name: "سارة المعيدة",
      email: "ta@insightsedu.com",
      password: pw,
      role: "TA",
      requirePasswordChange: false,
      emailVerified: new Date(),
    },
  });
  console.log("TA:", ta.email);

  // 4. Create Advisor
  const advisor = await prisma.user.upsert({
    where: { email: "advisor@insightsedu.com" },
    update: { password: pw, role: "ADVISOR", requirePasswordChange: false },
    create: {
      name: "د. أحمد المرشد",
      email: "advisor@insightsedu.com",
      password: pw,
      role: "ADVISOR",
      requirePasswordChange: false,
      emailVerified: new Date(),
    },
  });
  console.log("Advisor:", advisor.email);

  // 5. Assign TA to CS-EXPERT
  const csExpert = await prisma.course.findUnique({ where: { code: "CS-EXPERT" } });
  if (csExpert) {
    await prisma.teacherCourse.upsert({
      where: { teacherId_courseId: { teacherId: ta.id, courseId: csExpert.id } },
      update: {},
      create: { teacherId: ta.id, courseId: csExpert.id },
    });
    console.log("TA assigned to CS-EXPERT");
  }

  // 6. Assign seed teacher to all courses
  const teacher = await prisma.user.findUnique({ where: { email: "seed.teacher@edu.com" } });
  if (teacher) {
    const courses = await prisma.course.findMany();
    for (const c of courses) {
      await prisma.teacherCourse.upsert({
        where: { teacherId_courseId: { teacherId: teacher.id, courseId: c.id } },
        update: {},
        create: { teacherId: teacher.id, courseId: c.id },
      });
    }
    console.log("Teacher assigned to all courses");
  }

  // 7. Test user with force password change
  await prisma.user.upsert({
    where: { email: "newuser@insightsedu.com" },
    update: { password: pw, role: "STUDENT", requirePasswordChange: true },
    create: {
      name: "مستخدم جديد (اختبار)",
      email: "newuser@insightsedu.com",
      password: pw,
      role: "STUDENT",
      requirePasswordChange: true,
      emailVerified: new Date(),
    },
  });
  console.log("Test new user: newuser@insightsedu.com (force password change)");

  console.log("\nAll test users ready!");
  await prisma.$disconnect();
}

main().catch(console.error);
