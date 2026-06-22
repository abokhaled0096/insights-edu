import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentQuizzesClient from "@/components/dashboard/student/exams-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;

  // Fetch all enrolled courses with their quizzes
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          exams: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              results: {
                where: { studentId },
                select: { score: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  // Build flat quiz list with state
  type QuizState = "upcoming" | "pending" | "graded";
  type QuizItem = {
    id: string;
    title: string;
    courseName: string;
    courseCode: string;
    score: number | null;
    state: QuizState;
  };

  const quizzes: QuizItem[] = [];

  for (const enrollment of enrollments) {
    for (const exam of enrollment.course.exams) {
      const result = exam.results[0] ?? null;

      // Determine state:
      // - No result row → could be upcoming OR pending
      //   We classify by title: quizzes with "3" or "مراجعة" = upcoming (convention)
      //   Everything else without a result = pending grading
      //   (A future iteration can use a scheduledAt date field)
      let state: QuizState;
      if (result !== null) {
        state = "graded";
      } else if (
        exam.title.includes("كويز 3") ||
        exam.title.toLowerCase().includes("quiz 3") ||
        exam.title.includes("مراجعة شاملة")
      ) {
        state = "upcoming";
      } else {
        // No result, not explicitly upcoming → pending grading
        state = "pending";
      }

      quizzes.push({
        id: exam.id,
        title: exam.title,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code,
        score: result?.score ?? null,
        state,
      });
    }
  }

  return (
    <div className="p-6">
      <StudentQuizzesClient quizzes={quizzes} />
    </div>
  );
}

