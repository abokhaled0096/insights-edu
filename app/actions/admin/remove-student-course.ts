"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function removeStudentCourseAction(courseId: string, studentId: string) {
  try {
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          courseId,
          studentId,
        },
      },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Remove Student Course Error:", error);
    return { error: "فشل إزالة الطالب من الكورس" };
  }
}
