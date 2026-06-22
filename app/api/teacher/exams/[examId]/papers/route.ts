import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;
  const papers = await prisma.studentExamPaper.findMany({
    where: {
      examId,
    },
  });

  return Response.json(papers);
}