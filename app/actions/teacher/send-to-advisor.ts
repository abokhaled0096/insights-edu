"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; message: string };

export async function sendMessageToAdvisorAction(data: {
  studentId: string;
  message: string;
}): Promise<Result> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "TEACHER" && session.user.role !== "TA")) {
      return { success: false, message: "غير مصرح" };
    }
    if (!data.studentId || !data.message.trim()) {
      return { success: false, message: "البيانات ناقصة" };
    }

    // Find advisors in the system
    const advisors = await prisma.user.findMany({
      where: { role: "ADVISOR" },
      select: { id: true },
    });

    if (advisors.length === 0) {
      return { success: false, message: "لا يوجد مرشد أكاديمي في النظام" };
    }

    // Get student name for context
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
      select: { name: true },
    });

    const msgText = `رسالة من المعلم بخصوص الطالب "${student?.name || "غير معروف"}": ${data.message.trim()}`;

    // Send to all advisors
    await prisma.systemNotification.createMany({
      data: advisors.map((advisor) => ({
        senderId: session.user.id,
        receiverId: advisor.id,
        message: msgText,
      })),
    });

    revalidatePath("/teacher/messages");
    return { success: true, message: `تم إرسال الرسالة لـ ${advisors.length} مرشد أكاديمي` };
  } catch (error) {
    console.error("Send to Advisor Error:", error);
    return { success: false, message: "تعذر إرسال الرسالة" };
  }
}

export async function getTeacherMessagesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { students: [], sentMessages: [] };

    // Get students enrolled in teacher's courses
    const teacherCourses = await prisma.teacherCourse.findMany({
      where: { teacherId: session.user.id },
      select: { courseId: true },
    });
    const courseIds = teacherCourses.map((tc) => tc.courseId);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { student: { select: { id: true, name: true, email: true } } },
      distinct: ["studentId"],
    });

    const students = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
    }));

    // Get sent messages
    const sentMessages = await prisma.systemNotification.findMany({
      where: { senderId: session.user.id },
      include: {
        receiver: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      students,
      sentMessages: sentMessages.map((m) => ({
        id: m.id,
        receiverName: m.receiver.name,
        receiverRole: m.receiver.role,
        message: m.message,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Get Teacher Messages Error:", error);
    return { students: [], sentMessages: [] };
  }
}
