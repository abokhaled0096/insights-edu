"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function enrollStudentsAction(courseId: string, studentIds: string[]) {
  try {
    const enrollments = studentIds.map((studentId) => ({
      courseId,
      studentId,
    }));

    // Use createMany to ignore duplicates easily
    await prisma.enrollment.createMany({
      data: enrollments,
      skipDuplicates: true,
    });

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Enroll Students Error:", error);
    return { error: "فشل إضافة الطلاب للكورس" };
  }
}
