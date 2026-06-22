import { prisma } from "@/lib/prisma";
import EditExamTabs from "@/components/dashboard/teacher/exam/edit-exam-tabs";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const exam =
    await prisma.exam.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order:
              "asc",
          },
        },
      },
    });

  if (!exam) {
    return (
      <div className="p-6">
        Exam not found
      </div>
    );
  }

  // Serialize for client component - strip Date fields
  const serializedExam = {
    id: exam.id,
    title: exam.title,
    courseId: exam.courseId,
    questions: exam.questions.map((q) => ({
      id: q.id,
      examId: q.examId,
      text: q.text,
      type: q.type,
      bubbleCount: q.bubbleCount,
      x: q.x,
      y: q.y,
      width: q.width,
      height: q.height,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      order: q.order,
      options: q.options.map((o) => ({
        id: o.id,
        questionId: o.questionId,
        label: o.label,
        text: o.text,
        sortOrder: o.sortOrder,
      })),
    })),
  };

  return (
    <div className="p-6">
      <EditExamTabs
        exam={serializedExam}
      />
    </div>
  );
}