"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import {auth} from "@/auth"
export async function getTeachersAction() {
    const session = await auth()
    if (!session || session.user.role !== Role.ADMIN) {
        return [];
    }
    
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,

        teachings: {
          select: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },

        _count: {
          select: {
            teachings: true,
          },
        },
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      image: teacher.image,

      createdAt:
        teacher.createdAt.toISOString(),

      updatedAt:
        teacher.updatedAt.toISOString(),

      coursesCount:
        teacher._count.teachings,

      courses:
        teacher.teachings.map(
          (item) => ({
            id: item.course.id,
            name: item.course.name,
            code: item.course.code,
          })
        ),
    }));
  } catch (error) {
    console.error(
      "Get Teachers Error:",
      error
    );

    return [];
  }
}