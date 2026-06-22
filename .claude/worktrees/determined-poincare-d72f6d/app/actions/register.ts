"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/zod";

// دالة لتوليد رمز من 6 أرقام
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) return { error: "بيانات غير صالحة" };

  const { email, password, name } = validatedFields.data;
  const lowercaseEmail = email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });
    if (existingUser) return { error: "البريد الإلكتروني مستخدم بالفعل" };
    console.log(`Registering user with email: ${lowercaseEmail}`);
    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    console.log(`Generated OTP ${otpCode} for ${lowercaseEmail}`);
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          name,
          email: lowercaseEmail,
          password: hashedPassword,
        },
      });

      await tx.verificationToken.create({
        data: {
          email: lowercaseEmail,
          token: otpCode,
          expires,
        },
      });
    });
    
    
    console.log(`Sending OTP ${otpCode} to ${lowercaseEmail}`);

    return {
      success: "تم إنشاء الحساب بنجاح!",
      otp: otpCode,
      email: lowercaseEmail,
    };
  } catch (error) {
    return { error: "حدث خطأ أثناء التسجيل" };
  }
}
