"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type Result = {
  success: boolean;
  message: string;
};

export async function deleteStudentAction(
  studentId: string
): Promise<Result> {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, role: true },
    });

    if (!student || student.role !== "STUDENT") {
      return { success: false, message: "الطالب غير موجود" };
    }

    if (student.name) {
      try {
        await fetch("http://localhost:5000/delete-student-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: student.name }),
        });
      } catch {
        // Flask may be offline — proceed with DB deletion anyway
      }
    }

    await prisma.user.delete({
      where: {
        id: studentId,
        role: "STUDENT",
      },
    });

    revalidatePath("/admin/students");

    return {
      success: true,
      message: "تم حذف الطالب وبيانات الوش بنجاح",
    };
  } catch {
    return {
      success: false,
      message: "تعذر حذف الطالب",
    };
  }
}

export async function resetStudentPasswordAction(
  studentId: string
): Promise<Result> {
  try {
    const hashedPassword = await bcrypt.hash("123456", 12);
    await prisma.user.update({
      where: { id: studentId },
      data: {
        password: hashedPassword,
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

export async function removeStudentCodeAction(
  studentId: string
): Promise<Result> {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        studentCode: null,
      },
    });

    revalidatePath("/admin/students");

    return {
      success: true,
      message:
        "تم حذف كود الطالب",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر حذف الكود",
    };
  }
}

export async function makeTeacherAction(
  studentId: string
): Promise<Result> {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        role: "TEACHER",
      },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");

    return {
      success: true,
      message:
        "تم تحويل الطالب إلى مدرس",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تحويل الطالب",
    };
  }
}