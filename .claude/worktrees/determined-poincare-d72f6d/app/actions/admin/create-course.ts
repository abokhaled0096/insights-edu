"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type State = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const emptyToUndefined = (
  value: unknown
) =>
  value === ""
    ? undefined
    : value;

const schema = z.object({
  name: z
    .string()
    .min(
      3,
      "اسم الكورس يجب أن يكون 3 أحرف على الأقل"
    ),

  code: z
    .string()
    .min(
      2,
      "كود المادة مطلوب"
    )
    .max(
      20,
      "كود المادة طويل جدًا"
    ),

  description: z.preprocess(
    emptyToUndefined,
    z.string().optional()
  ),
});

export async function createCourseAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const parsed =
      schema.safeParse({
        name: formData.get(
          "name"
        ),
        code: formData
          .get("code")
          ?.toString()
          .trim()
          .toUpperCase(),
        description:
          formData.get(
            "description"
          ),
      });

    if (!parsed.success) {
      return {
        success: false,
        errors:
          parsed.error.flatten()
            .fieldErrors,
      };
    }

    const data = parsed.data;

    const exists =
      await prisma.course.findUnique(
        {
          where: {
            code: data.code,
          },
        }
      );

    if (exists) {
      return {
        success: false,
        errors: {
          code: [
            "هذا الكود مستخدم بالفعل",
          ],
        },
      };
    }

    await prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        description:
          data.description,
      },
    });

    revalidatePath(
      "/admin/courses"
    );

    return {
      success: true,
      message:
        "تم إنشاء الكورس بنجاح",
    };
  } catch (error) {
    console.error(
      "Create Course Error:",
      error
    );

    return {
      success: false,
      errors: {
        general: [
          "حدث خطأ أثناء إنشاء الكورس",
        ],
      },
    };
  }
}