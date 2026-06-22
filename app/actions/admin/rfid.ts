"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; message: string; code?: string };

/** Generate a unique RFID student code and assign it to a student */
export async function generateRfidCardAction(studentId: string): Promise<Result> {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: "STUDENT" },
      select: { id: true, studentCode: true },
    });

    if (!student) return { success: false, message: "الطالب غير موجود" };
    if (student.studentCode)
      return { success: false, message: "الطالب لديه كود بالفعل: " + student.studentCode };

    // Generate a unique 8-char hex code
    const generateCode = () =>
      Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16).toUpperCase()
      ).join("");

    let code = generateCode();
    // Ensure uniqueness
    let existing = await prisma.user.findUnique({ where: { studentCode: code } });
    while (existing) {
      code = generateCode();
      existing = await prisma.user.findUnique({ where: { studentCode: code } });
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { studentCode: code },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/users");

    return { success: true, message: `تم توليد الكود: ${code}`, code };
  } catch (error) {
    console.error("RFID Generate Error:", error);
    return { success: false, message: "تعذر توليد الكود" };
  }
}

/** Manually map a specific RFID UID to a student */
export async function mapRfidCardAction(studentId: string, rfidCode: string): Promise<Result> {
  try {
    const code = rfidCode.trim().toUpperCase();
    if (!code) return { success: false, message: "أدخل كود RFID" };

    const existing = await prisma.user.findUnique({ where: { studentCode: code } });
    if (existing && existing.id !== studentId)
      return { success: false, message: "هذا الكود مستخدم من طالب آخر" };

    await prisma.user.update({
      where: { id: studentId },
      data: { studentCode: code },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/users");

    return { success: true, message: `تم ربط الكود ${code} بالطالب`, code };
  } catch (error) {
    console.error("RFID Map Error:", error);
    return { success: false, message: "تعذر ربط الكود" };
  }
}
