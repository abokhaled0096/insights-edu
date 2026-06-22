"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createTeacherSchema = z.object({
  name: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),

  email: z.email("بريد إلكتروني غير صالح"),

  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export async function createTeacherAction(
  prevState: any,
  formData: FormData
) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validated =
      createTeacherSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        errors:
          validated.error.flatten().fieldErrors,
      };
    }

    const data = validated.data;

    const exists = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (exists) {
      return {
        success: false,
        errors: {
          email: ["هذا البريد مستخدم بالفعل"],
        },
      };
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 10);

    const teacher = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "TEACHER",
      },
    });

    // optional admin log
    await prisma.adminLog.create({
      data: {
        adminId: teacher.id,
        action: "CREATE_TEACHER",
        entityType: "USER",
        entityId: teacher.id,
        description: `تم إنشاء مدرس جديد: ${teacher.name}`,
      },
    });

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message: "تم إنشاء المدرس بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      message: "حدث خطأ أثناء الإنشاء",
    };
  }
}