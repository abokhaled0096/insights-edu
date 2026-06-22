import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import StudentCourseDetailClient from "@/components/dashboard/student/course-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: courseId } = await params;
  const studentId = session.user.id;

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) notFound();

  // Fetch course with all data
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teachers: {
        include: { teacher: { select: { name: true } } },
      },
      exams: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          results: {
            where: { studentId },
            select: { score: true },
          },
        },
      },
      attendances: {
        where: { studentId },
        orderBy: { date: "desc" },
        take: 30,
        select: { status: true, date: true },
      },
    },
  });

  if (!course) notFound();

  // Quiz states
  type QuizState = "upcoming" | "pending" | "graded";
  type QuizItem = {
    id: string;
    title: string;
    score: number | null;
    state: QuizState;
  };

  const quizzes: QuizItem[] = course.exams.map((exam) => {
    const result = exam.results[0] ?? null;
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
      state = "pending";
    }

    return {
      id: exam.id,
      title: exam.title,
      score: result?.score ?? null,
      state,
    };
  });

  // Attendance stats
  const totalAtt   = course.attendances.length;
  const presentAtt = course.attendances.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = totalAtt === 0 ? 0 : Math.round((presentAtt / totalAtt) * 100);

  // Grade stats (graded quizzes only)
  const gradedQuizzes = quizzes.filter((q) => q.state === "graded" && q.score !== null);
  const avgScore = gradedQuizzes.length === 0
    ? null
    : Math.round(gradedQuizzes.reduce((s, q) => s + (q.score ?? 0), 0) / gradedQuizzes.length);

  return (
    <div className="p-6">
      <StudentCourseDetailClient
        course={{
          id: course.id,
          name: course.name,
          code: course.code,
          description: course.description,
          teacherName: course.teachers[0]?.teacher?.name ?? "غير محدد",
        }}
        quizzes={quizzes}
        attendanceRate={attendanceRate}
        avgScore={avgScore}
        recentAttendance={course.attendances.slice(0, 10).map((a) => ({
          status: a.status,
          date: a.date.toISOString(),
        }))}
      />
    </div>
  );
}
