import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeacherStudentInsightClient from "./TeacherStudentInsightClient";

export default async function TeacherStudentInsightPage({
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
    session.user.role !== "ADMIN"
  ) {
    redirect("/");
  }

  const student = await prisma.user.findUnique({
    where: {
      id: (await params).id,
      role: "STUDENT",
    },
    include: {
      insights: {
        orderBy: {
          generatedAt: "desc",
        },
        take: 1,
      },
      examResults: true,
      attendances: true,
      submissions: true,
    },
  });

  if (!student) {
    notFound();
  }

  const latestInsight = student.insights[0] || null;

  return (
    <TeacherStudentInsightClient
      student={{
        id: student.id,
        name: student.name,
        studentCode: student.studentCode,
        email: student.email,
      }}
      latestInsight={latestInsight}
    />
  );
}