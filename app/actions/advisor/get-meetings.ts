"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdvisorMeetingsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADVISOR") return [];

    const meetings = await prisma.advisorMeeting.findMany({
      where: { advisorId: session.user.id },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { meetingDate: "desc" },
    });

    return meetings.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      studentName: m.student.name,
      studentEmail: m.student.email,
      meetingDate: m.meetingDate.toISOString(),
      notes: m.notes,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get Meetings Error:", error);
    return [];
  }
}
