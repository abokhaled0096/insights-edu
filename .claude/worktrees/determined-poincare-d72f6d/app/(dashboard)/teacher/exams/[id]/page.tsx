import { prisma } from "@/lib/prisma";
import GeneratePapersButton from "@/components/dashboard/teacher/exam/GeneratePapersButton";

export default async function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const exam = await prisma.exam.findUnique({
    where: {
      id: resolvedParams.id,
    },
    include: {
      questions: true,
      course: true,
    },
  });

  if (!exam) return <div>Not found</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{exam.title}</h1>
      <p>{exam.course.name}</p>

      <GeneratePapersButton examId={exam.id} />

      {exam.questions.map((q) => (
        <div key={q.id} className="border p-4 rounded">
          {q.text}
        </div>
      ))}
    </div>
  );
}