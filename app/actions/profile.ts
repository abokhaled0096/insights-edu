"use server";

// app/actions/profile.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result = {
  success: boolean;
  message: string;
};

export async function getProfileAction() {
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
            updatedAt: true,

            _count: {
              select: {
                enrollments:
                  true,
                teachings:
                  true,
                attendances:
                  true,
              },
            },
          },
        }
      );

    if (!user)
      return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      studentCode:
        user.studentCode,

      createdAt:
        user.createdAt.toISOString(),

      updatedAt:
        user.updatedAt.toISOString(),

      stats: {
        enrollments:
          user._count
            .enrollments,

        teachings:
          user._count
            .teachings,

        attendances:
          user._count
            .attendances,
      },
    };
  } catch (error) {
    console.error(
      "Profile Error:",
      error
    );

    return null;
  }
}

export async function updateProfileImageAction(
  image: string
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

    await prisma.user.update({
      where: {
        id: session
          .user.id,
      },

      data: {
        image:
          image ||
          null,
      },
    });

    revalidatePath(
      "/profile"
    );

    return {
      success: true,
      message:
        "تم تحديث الصورة",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تحديث الصورة",
    };
  }
}

export async function updateProfileNameAction(
  name: string
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

    await prisma.user.update({
      where: {
        id: session
          .user.id,
      },

      data: {
        name,
      },
    });

    revalidatePath(
      "/profile"
    );

    return {
      success: true,
      message:
        "تم تحديث الاسم",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر تحديث الاسم",
    };
  }
}