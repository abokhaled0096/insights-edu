"use server";

// app/actions/settings.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type Result = {
  success: boolean;
  message: string;
};

export async function getSettingsAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return null;
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            id: session
              .user.id,
          },

          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            studentCode: true,
            createdAt: true,
          },
        }
      );

    if (!user) return null;

    return {
      ...user,
      createdAt:
        user.createdAt.toISOString(),
    };
  } catch (error) {
    console.error(
      "Settings Error:",
      error
    );

    return null;
  }
}

export async function updateProfileAction(
  formData: FormData
): Promise<Result> {
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

    const name =
      formData
        .get("name")
        ?.toString()
        .trim() || "";

    const image =
      formData
        .get("image")
        ?.toString()
        .trim() || "";

    await prisma.user.update({
      where: {
        id: session
          .user.id,
      },

      data: {
        name,
        image:
          image || null,
      },
    });

    revalidatePath(
      "/settings"
    );

    return {
      success: true,
      message:
        "تم تحديث الملف الشخصي",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تحديث البيانات",
    };
  }
}

export async function changePasswordAction(
  formData: FormData
): Promise<Result> {
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

    const password =
      formData
        .get(
          "password"
        )
        ?.toString()
        .trim() || "";

    if (
      password.length <
      6
    ) {
      return {
        success: false,
        message:
          "كلمة المرور قصيرة",
      };
    }

    const hashed =
      await bcrypt.hash(
        password,
        12
      );

    await prisma.user.update({
      where: {
        id: session
          .user.id,
      },

      data: {
        password:
          hashed,
      },
    });

    return {
      success: true,
      message:
        "تم تغيير كلمة المرور",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تغيير كلمة المرور",
    };
  }
}