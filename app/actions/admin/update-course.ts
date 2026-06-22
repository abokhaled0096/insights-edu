"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type State = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(3, "اسم الكورس يجب أن يكون 3 أحرف على الأقل"),
  code: z.string().min(2, "كود المادة مطلوب").max(20, "كود المادة طويل جدًا"),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
});

export async function updateCourseAction(prevState: State, formData: FormData): Promise<State> {
  try {
    const parsed = schema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code")?.toString().trim().toUpperCase(),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    const exists = await prisma.course.findUnique({
      where: { code: data.code },
    });

    if (exists && exists.id !== data.id) {
      return {
        success: false,
        errors: {
          code: ["هذا الكود مستخدم بالفعل لكورس آخر"],
        },
      };
    }

    await prisma.course.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${data.id}`);

    return {
      success: true,
      message: "تم تحديث الكورس بنجاح",
    };
  } catch (error) {
    console.error("Update Course Error:", error);
    return {
      success: false,
      errors: {
        general: ["حدث خطأ أثناء تحديث الكورس"],
      },
    };
  }
}
