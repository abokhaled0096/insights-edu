"use server";

import { prisma } from "@/lib/prisma";
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export async function resendOTP(email: string) {
  const lowercaseEmail = email.toLowerCase();
  const otpCode = generateOTP();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  try {
    // حذف أي رموز قديمة لهذا الإيميل
    await prisma.verificationToken.deleteMany({ where: { email: lowercaseEmail } });

    // إنشاء الرمز الجديد
    await prisma.verificationToken.create({
      data: { email: lowercaseEmail, token: otpCode, expires }
    });

    console.log(`Resending OTP ${otpCode} to ${lowercaseEmail}`);
    return { success: "تم إعادة إرسال الرمز" };
  } catch (error) {
    return { error: "فشل إعادة الإرسال" };
  }
}