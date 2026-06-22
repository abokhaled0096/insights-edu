"use server";

import { prisma } from "@/lib/prisma";

export async function verifyOTP(email: string, token: string) {
  try {
    // 1. البحث عن الرمز في قاعدة البيانات
    const existingToken = await prisma.verificationToken.findFirst({
      where: { 
        email: email.toLowerCase(),
        token: token
      }
    });

    if (!existingToken) return { error: "رمز التحقق غير صحيح" };

    // 2. التحقق من الصلاحية
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { error: "انتهت صلاحية الرمز" };

    // 3. تحديث المستخدم وحذف الرمز
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: email.toLowerCase() },
        data: { emailVerified: new Date() }
      });

      await tx.verificationToken.delete({
        where: { id: existingToken.id }
      });
    });

    return { success: "تم تفعيل الحساب بنجاح" };
  } catch (error) {
    return { error: "فشل التحقق، يرجى المحاولة لاحقاً" };
  }
}