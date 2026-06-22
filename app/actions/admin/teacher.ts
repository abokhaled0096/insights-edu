"use server";

// app/actions/admin/teacher-actions.ts

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type Result = {
  success: boolean;
  message: string;
};

export async function deleteTeacherAction(
  teacherId: string
): Promise<Result> {
  try {
    await prisma.user.delete({
      where: {
        id: teacherId,
      },
    });

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message: "تم حذف المدرس بنجاح",
    };
  } catch {
    return {
      success: false,
      message: "تعذر حذف المدرس",
    };
  }
}

export async function resetTeacherPasswordAction(
  teacherId: string
): Promise<Result> {
  try {
    const password =
      await bcrypt.hash(
        "123456",
        12
      );

    await prisma.user.update({
      where: {
        id: teacherId,
      },
      data: {
        password,
      },
    });

    return {
      success: true,
      message:
        "تم إعادة تعيين كلمة المرور إلى 123456",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر إعادة تعيين كلمة المرور",
    };
  }
}

export async function makeTeacherAdminAction(
  teacherId: string
): Promise<Result> {
  try {
    await prisma.user.update({
      where: {
        id: teacherId,
      },
      data: {
        role: "ADMIN",
      },
    });

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message:
        "تم تحويل المدرس إلى أدمن",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تحويل المدرس",
    };
  }
}

export async function removeTeacherCoursesAction(
  teacherId: string
): Promise<Result> {
  try {
    await prisma.teacherCourse.deleteMany(
      {
        where: {
          teacherId,
        },
      }
    );

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message:
        "تم فك ربط الكورسات من المدرس",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تنفيذ العملية",
    };
  }
}