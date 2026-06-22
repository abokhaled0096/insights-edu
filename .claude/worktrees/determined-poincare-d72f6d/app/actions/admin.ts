"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [
    usersCount,
    coursesCount,
    activeCourses,
    teachersCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: { role: "TEACHER" },
    }),
  ]);

  return {
    usersCount,
    coursesCount,
    activeCourses,
    teachersCount,
  };
}

export async function getRecentUsers() {
  return prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getRecentCourses() {
  return prisma.course.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      teachers: {
        include: {
          teacher: true,
        },
      },
      _count: {
        select: {
          students: true,
        },
      },
    },
  });
}

export async function getRecentActivities() {
  return prisma.adminLog.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      admin: true,
    },
  });
}