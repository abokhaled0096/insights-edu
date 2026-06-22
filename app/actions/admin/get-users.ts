"use server";

import { prisma } from "@/lib/prisma";

export async function getAllUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentCode: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            attendances: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      studentCode: u.studentCode,
      createdAt: u.createdAt.toISOString(),
      enrollmentsCount: u._count.enrollments,
      attendancesCount: u._count.attendances,
    }));
  } catch (error) {
    console.error("Get Users Error:", error);
    return [];
  }
}
