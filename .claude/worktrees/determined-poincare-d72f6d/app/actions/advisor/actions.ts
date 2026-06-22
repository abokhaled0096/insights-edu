"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; message: string };

async function requireAdvisor() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVISOR") throw new Error("Unauthorized");
  return session.user;
}

export async function saveRecommendationAction(data: { studentId: string; text: string; isWarning: boolean }): Promise<Result> {
  try {
    const user = await requireAdvisor();
    await prisma.advisorRecommendation.create({ data: { advisorId: user.id, studentId: data.studentId, text: data.text, isWarning: data.isWarning } });
    await prisma.systemNotification.create({ data: { senderId: user.id, receiverId: data.studentId, message: (data.isWarning ? "\u26A0\uFE0F \u062A\u062D\u0630\u064A\u0631: " : "\u062A\u0648\u0635\u064A\u0629: ") + data.text } });
    revalidatePath("/advisor");
    return { success: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0648\u0635\u064A\u0629" };
  } catch { return { success: false, message: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062D\u0641\u0638" }; }
}
export async function scheduleMeetingAction(data: { studentId: string; meetingDate: string; notes?: string }): Promise<Result> {
  try {
    const user = await requireAdvisor();
    await prisma.advisorMeeting.create({ data: { advisorId: user.id, studentId: data.studentId, meetingDate: new Date(data.meetingDate), notes: data.notes || null } });
    await prisma.systemNotification.create({ data: { senderId: user.id, receiverId: data.studentId, message: "\u062A\u0645 \u062C\u062F\u0648\u0644\u0629 \u0627\u062C\u062A\u0645\u0627\u0639 \u0645\u0639\u0643" } });
    revalidatePath("/advisor");
    return { success: true, message: "\u062A\u0645 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639" };
  } catch { return { success: false, message: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062C\u062F\u0648\u0644\u0629" }; }
}

export async function updateMeetingStatusAction(meetingId: string, status: "COMPLETED" | "CANCELLED"): Promise<Result> {
  try {
    await requireAdvisor();
    await prisma.advisorMeeting.update({ where: { id: meetingId }, data: { status } });
    revalidatePath("/advisor");
    return { success: true, message: "\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B" };
  } catch { return { success: false, message: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B" }; }
}
