"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result = {
  success: boolean;
  message: string;
};

export async function getAttendancePageAction() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return {
        courses: [],
        activeSession: null,
        records: [],
      };
    }

    const teacherId =
      session.user.id;

    const [
      courses,
      activeSession,
      records,
    ] = await Promise.all([
      prisma.teacherCourse.findMany(
        {
          where: {
            teacherId,
          },

          select: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        }
      ),

      prisma.attendanceSession.findFirst(
        {
          where: {
            course: {
              teachers: {
                some: {
                  teacherId,
                },
              },
            },
            active: true,
          },

          include: {
            course: true,
          },

          orderBy: {
            startedAt:
              "desc",
          },
        }
      ),

      prisma.attendance.findMany(
        {
          take: 30,

          where: {
            course: {
              teachers: {
                some: {
                  teacherId,
                },
              },
            },
          },

          orderBy: {
            date: "desc",
          },

          include: {
            student: {
              select: {
                name: true,
                studentCode: true,
              },
            },

            course: {
              select: {
                name: true,
              },
            },

            session: {
              select: {
                id: true,
              },
            },
          },
        }
      ),
    ]);

    return {
      courses:
        courses.map(
          (item) => ({
            id: item.course.id,
            name: item.course.name,
            code: item.course.code,
          })
        ),

      activeSession:
        activeSession
          ? {
              id: activeSession.id,
              startedAt:
                activeSession.startedAt.toISOString(),
              course:
                activeSession.course.name,
            }
          : null,

      records:
        records.map(
          (item) => ({
            id: item.id,
            student:
              item.student
                ?.name ||
              "طالب",
            code:
              item.student
                ?.studentCode ||
              "-",
            course:
              item.course
                ?.name ||
              "-",
            sessionId:
              item.session
                ?.id ||
              "-",
            status:
              item.status,
            createdAt:
              item.date.toISOString(),
          })
        ),
    };
  } catch (error) {
    console.error(
      "Attendance Error:",
      error
    );

    return {
      courses: [],
      activeSession: null,
      records: [],
    };
  }
}

export async function createAttendanceSessionAction(
  courseId: string
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

    const teacherId =
      session.user.id;

    const hasCourse =
      await prisma.teacherCourse.findFirst(
        {
          where: {
            teacherId,
            courseId,
          },
        }
      );

    if (!hasCourse) {
      return {
        success: false,
        message:
          "هذا الكورس غير مرتبط بك",
      };
    }

    await prisma.attendanceSession.updateMany(
      {
        where: {
          courseId,
          active: true,
        },

        data: {
          active: false,
          endedAt:
            new Date(),
        },
      }
    );

    // Create session with 15-minute expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    await prisma.attendanceSession.create({
      data: {
        courseId,
        active: true,
        expiresAt,
      },
    });

    revalidatePath("/teacher/attendance");

    return {
      success: true,
      message: "تم بدء جلسة الحضور (تنتهي خلال 15 دقيقة)",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر إنشاء الجلسة",
    };
  }
}

export async function endAttendanceSessionAction(): Promise<Result> {
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

    await prisma.attendanceSession.updateMany(
      {
        where: {
          course: {
            teachers: {
              some: {
                teacherId:
                  session.user.id,
              },
            },
          },
          active: true,
        },

        data: {
          active: false,
          endedAt:
            new Date(),
        },
      }
    );

    revalidatePath(
      "/teacher/attendance"
    );

    return {
      success: true,
      message:
        "تم إنهاء الجلسة",
    };
  } catch {
    return {
      success: false,
      message:
        "تعذر إنهاء الجلسة",
    };
  }
}