"use server";

// app/actions/teacher/activity-content.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addActivityContentAction(
  prevState: any,
  formData: FormData
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        success: false,
        message:
          "Unauthorized",
      };
    }

    const activityId =
      String(
        formData.get(
          "activityId"
        )
      );

    const title =
      String(
        formData.get(
          "title"
        ) || ""
      );

    const type =
      String(
        formData.get(
          "type"
        ) || ""
      );

    const body =
      String(
        formData.get(
          "body"
        ) || ""
      );

    const count =
      await prisma.activityContent.count(
        {
          where: {
            activityId,
          },
        }
      );

    await prisma.activityContent.create(
      {
        data: {
          activityId,
          title,
          type:
            type as any,
          body,
          sortOrder:
            count + 1,
        },
      }
    );

    revalidatePath(
      "/teacher/activities"
    );

    return {
      success: true,
      message:
        "تمت الإضافة بنجاح",
    };
  } catch {
    return {
      success: false,
      message:
        "فشل الإضافة",
    };
  }
}

export async function deleteActivityContentAction(
  formData: FormData
) {
  const id = String(
    formData.get("id")
  );

  await prisma.activityContent.delete(
    {
      where: {
        id,
      },
    }
  );

  revalidatePath(
    "/teacher/activities"
  );
}