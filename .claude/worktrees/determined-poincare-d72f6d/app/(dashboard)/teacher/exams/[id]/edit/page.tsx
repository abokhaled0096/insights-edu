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

  return (
    <div className="p-6">
      <EditExamTabs
        exam={exam}
      />
    </div>
  );
}