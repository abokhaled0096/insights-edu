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
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function getRecentCourses() {
  const courses = await prisma.course.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      teachers: {
        include: {
          teacher: { select: { name: true } },
        },
      },
      _count: {
        select: { students: true },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    studentsCount: c._count.students,
    teacherName: c.teachers[0]?.teacher?.name || "بدون مدرس",
  }));
}

export async function getRecentActivities() {
  const logs = await prisma.adminLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      description: true,
      createdAt: true,
    },
  });

  return logs.map((item) => ({
    id: item.id,
    action: item.action,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
  }));
}