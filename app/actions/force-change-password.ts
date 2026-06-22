"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function forceChangePassword(newPassword: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "غير مصرح" };

    if (newPassword.length < 8) {
      return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
    }

    // Enforce strong password: at least 1 uppercase, 1 lowercase, 1 digit
    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!strongPattern.test(newPassword)) {
      return { error: "كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم على الأقل" };
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashed,
        requirePasswordChange: false,
      },
    });

    return { success: true };
  } catch {
    return { error: "فشل تغيير كلمة المرور" };
  }
}
