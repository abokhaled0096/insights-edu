import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  const papers = await prisma.studentExamPaper.findMany({
    where: {
      examId: params.examId,
    },
  });

  return Response.json(papers);
}