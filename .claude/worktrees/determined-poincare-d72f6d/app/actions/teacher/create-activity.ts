"use server";

// app/actions/teacher/create-course-activity.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "العنوان قصير"),

  description: z.string().optional(),

  type: z.enum(["TASK", "QUIZ", "PROJECT", "EXAM", "EVENT"]),

  courseId: z.string().min(1, "اختر الكورس"),

  points: z.coerce.number().min(0),

  dueDate: z.string().optional(),
});

export async function createCourseActivityAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "غير مصرح",
      };
    }

    const teacherId = session.user.id;

    const raw = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      courseId: formData.get("courseId"),
      points: formData.get("points"),
      dueDate: formData.get("dueDate"),
    };

    const validated = schema.safeParse(raw);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const data = validated.data;

    const hasCourse = await prisma.teacherCourse.findFirst({
      where: {
        teacherId,
        courseId: data.courseId,
      },
    });

    if (!hasCourse) {
      return {
        success: false,
        message: "هذا الكورس غير تابع لك",
      };
    }

    await prisma.studentActivity.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        courseId: data.courseId,
        points: data.points,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    revalidatePath("/teacher/activities");

    return {
      success: true,
      message: "تم إنشاء النشاط بنجاح",
    };
  } catch {
    return {
      success: false,
      message: "فشل إنشاء النشاط",
    };
  }
}
