"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function resetAnyUserPasswordAction(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, message: "غير مصرح لك للقيام بهذا الإجراء" };
    }

    const hashedPassword = await bcrypt.hash("123456", 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        requirePasswordChange: true, // Force them to change it on next login
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/students");

    return {
      success: true,
      message: "تم تعيين كلمة المرور إلى 123456 بنجاح",
    };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
    };
  }
}
