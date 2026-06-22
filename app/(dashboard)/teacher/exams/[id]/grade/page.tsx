import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeacherExamGradeClient from "@/components/dashboard/teacher/exam/grade-client";

export default async function TeacherExamGradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (
    session.user.role !== "TEACHER" &&
    session.user.role !== "TA" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/");
  }
  const resolvedParams = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: resolvedParams.id },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
      },
      course: {
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  studentCode: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  const students = exam.course.students.map((item) => ({
    id: item.student.id,
    name: item.student.name,
    studentCode: item.student.studentCode,
  }));

  const totalMarks = exam.questions.reduce(
    (sum, q) => sum + q.marks,
    0
  );

  return (
    <TeacherExamGradeClient
      examId={exam.id}
      examTitle={exam.title}
      totalMarks={totalMarks}
      students={students}
    />
  );
}