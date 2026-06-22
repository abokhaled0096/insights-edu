"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; message: string };

export async function sendNotificationToStudentAction(data: {
  receiverId: string;
  message: string;
}): Promise<Result> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return { success: false, message: "غير مصرح" };
    }
    if (!data.receiverId || !data.message.trim()) {
      return { success: false, message: "البيانات ناقصة" };
    }
    await prisma.systemNotification.create({
      data: {
        senderId: session.user.id,
        receiverId: data.receiverId,
        message: data.message.trim(),
      },
    });
    revalidatePath("/teacher/students");
    return { success: true, message: "تم إرسال الإشعار" };
  } catch (error) {
    console.error("Send Notification Error:", error);
    return { success: false, message: "تعذر إرسال الإشعار" };
  }
}

export async function sendNotificationToAllStudentsAction(data: {
  message: string;
}): Promise<Result> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return { success: false, message: "غير مصرح" };
    }
    if (!data.message.trim()) {
      return { success: false, message: "الرسالة فارغة" };
    }

    // Get all students enrolled in this teacher's courses
    const teacherCourses = await prisma.teacherCourse.findMany({
      where: { teacherId: session.user.id },
      select: { courseId: true },
    });
    const courseIds = teacherCourses.map((tc) => tc.courseId);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { studentId: true },
      distinct: ["studentId"],
    });

    if (enrollments.length === 0) {
      return { success: false, message: "لا يوجد طلاب مسجلين في كورساتك" };
    }

    await prisma.systemNotification.createMany({
      data: enrollments.map((e) => ({
        senderId: session.user.id,
        receiverId: e.studentId,
        message: data.message.trim(),
      })),
    });

    return {
      success: true,
      message: `تم إرسال الإشعار لـ ${enrollments.length} طالب`,
    };
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    return { success: false, message: "تعذر إرسال الإشعار" };
  }
}
