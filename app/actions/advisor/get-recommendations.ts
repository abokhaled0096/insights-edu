"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdvisorRecommendationsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") return [];

    const recommendations = await prisma.advisorRecommendation.findMany({
      where: { advisorId: session.user.id },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return recommendations.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.name,
      studentEmail: r.student.email,
      text: r.text,
      isWarning: r.isWarning,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get Recommendations Error:", error);
    return [];
  }
}
