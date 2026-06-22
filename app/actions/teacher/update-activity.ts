"use server";

// app/actions/teacher/update-activity.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<
    string,
    string[]
  >;
};

const schema = z.object({
  id: z.string().min(1),

  title: z
    .string()
    .min(
      3,
      "العنوان قصير"
    ),

  description:
    z.string().optional(),

  type: z.enum([
    "TASK",
    "QUIZ",
    "PROJECT",
    "EXAM",
    "EVENT",
  ]),

  courseId:
    z.string().min(1),

  points: z.coerce
    .number()
    .min(0),

  dueDate:
    z.string().optional(),
});

export async function updateActivityAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        success: false,
        message:
          "غير مصرح",
      };
    }

    const teacherId =
      session.user.id;

    const raw = {
      id: String(
        formData.get(
          "id"
        ) || ""
      ),

      title: String(
        formData.get(
          "title"
        ) || ""
      ),

      description:
        String(
          formData.get(
            "description"
          ) || ""
        ),

      type: String(
        formData.get(
          "type"
        ) || ""
      ),

      courseId:
        String(
          formData.get(
            "courseId"
          ) || ""
        ),

      points: String(
        formData.get(
          "points"
        ) || "0"
      ),

      dueDate:
        String(
          formData.get(
            "dueDate"
          ) || ""
        ),
    };

    const validated =
      schema.safeParse(
        raw
      );

    if (
      !validated.success
    ) {
      return {
        success: false,
        errors:
          validated.error.flatten()
            .fieldErrors,
      };
    }

    const data =
      validated.data;

    const activity =
      await prisma.studentActivity.findFirst(
        {
          where: {
            id: data.id,
            course: {
              teachers:
                {
                  some:
                    {
                      teacherId,
                    },
                },
            },
          },
        }
      );

    if (
      !activity
    ) {
      return {
        success: false,
        message:
          "النشاط غير موجود",
      };
    }

    await prisma.studentActivity.update(
      {
        where: {
          id: data.id,
        },

        data: {
          title:
            data.title,
          description:
            data.description ||
            null,
          type: data.type,
          courseId:
            data.courseId,
          points:
            data.points,
          dueDate:
            data.dueDate
              ? new Date(
                  data.dueDate
                )
              : null,
        },
      }
    );

    revalidatePath(
      "/teacher/activities"
    );

    return {
      success: true,
      message:
        "تم تعديل النشاط",
    };
  } catch {
    return {
      success: false,
      message:
        "فشل تعديل النشاط",
    };
  }
}