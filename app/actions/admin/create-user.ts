"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createUserSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["ADMIN", "TEACHER", "TA", "STUDENT", "ADVISOR"]),
});

export async function createUserAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, message: "غير مصرح - يجب أن تكون أدمن" };
    }

    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    const validated = createUserSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const data = validated.data;

    const exists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (exists) {
      return { success: false, errors: { email: ["هذا البريد مستخدم بالفعل"] } };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role as any,
        requirePasswordChange: true, // Force password change on first login
        emailVerified: new Date(), // Admin-created accounts are pre-verified
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "CREATE_USER",
        entityType: "USER",
        entityId: user.id,
        description: `تم إنشاء مستخدم جديد: ${user.name} (${data.role})`,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");

    const roleLabels: Record<string, string> = {
      ADMIN: "أدمن",
      TEACHER: "مدرس",
      TA: "معيد",
      STUDENT: "طالب",
      ADVISOR: "مرشد أكاديمي",
    };

    return {
      success: true,
      message: `تم إنشاء حساب ${roleLabels[data.role]} بنجاح: ${data.name}`,
    };
  } catch (error) {
    console.error("Create User Error:", error);
    return { success: false, message: "حدث خطأ أثناء إنشاء المستخدم" };
  }
}
