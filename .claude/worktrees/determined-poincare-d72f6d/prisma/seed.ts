import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const courses = [
  { code: 'CS-EXPERT', name: 'نظم خبيره', description: 'مقرر النظم الخبيرة وتطبيقاتها' },
  { code: 'AI-EDU', name: 'تطبيقات الذكاء الاصطناعي في التعليم', description: 'تطبيقات AI في المجال التعليمي' },
  { code: 'NET-SEC', name: 'أمن الشبكات', description: 'مقرر أمن الشبكات والمعلومات' },
];

async function main() {
  console.log('Seeding courses...');

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: { name: course.name, description: course.description },
      create: course,
    });
    console.log(`  ✓ ${course.code} - ${course.name}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
