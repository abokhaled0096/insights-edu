"use server";

// app/actions/student/submit-activity.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type State = {
  success?: boolean;
  message?: string;
};

export async function submitActivityAction(
  prevState: State,
  formData: FormData
): Promise<State> {
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

    const studentId =
      session.user.id;

    const activityId =
      String(
        formData.get(
          "activityId"
        ) || ""
      );

    const textAnswer =
      String(
        formData.get(
          "textAnswer"
        ) || ""
      );

    const fileUrl =
      String(
        formData.get(
          "fileUrl"
        ) || ""
      );

    const activity =
      await prisma.studentActivity.findFirst(
        {
          where: {
            id: activityId,
            course: {
              students: {
                some: {
                  studentId,
                },
              },
            },
          },
        }
      );

    if (!activity) {
      return {
        success: false,
        message:
          "النشاط غير موجود",
      };
    }

    const now =
      new Date();

    const isLate =
      activity.dueDate
        ? now >
          activity.dueDate
        : false;

    await prisma.activitySubmission.upsert(
      {
        where: {
          activityId_studentId:
            {
              activityId,
              studentId,
            },
        },

        update: {
          textAnswer:
            textAnswer ||
            null,

          fileUrl:
            fileUrl ||
            null,

          submittedAt:
            now,

          status:
            isLate
              ? "LATE"
              : "SUBMITTED",
        },

        create: {
          activityId,
          studentId,

          textAnswer:
            textAnswer ||
            null,

          fileUrl:
            fileUrl ||
            null,

          submittedAt:
            now,

          status:
            isLate
              ? "LATE"
              : "SUBMITTED",
        },
      }
    );

    revalidatePath(
      `/student/activities/${activityId}`
    );

    return {
      success: true,
      message:
        "تم تسليم النشاط بنجاح",
    };
  } catch {
    return {
      success: false,
      message:
        "فشل التسليم",
    };
  }
}