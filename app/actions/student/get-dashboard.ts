"use server";

// app/actions/student/get-dashboard.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentDashboardAction() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        stats: { courses: 0, attendance: 0, exams: 0, assignments: 0 },
        courses: [],
        recentAttendance: [],
        exams: [],
        notifications: [],
        recommendations: [],
        grades: [],
      };
    }

    const studentId = session.user.id;

    const [
      enrollments,
      attendanceCount,
      examResultsCount,
      assignmentsCount,
      recentAttendance,
      upcomingAssignments,
      notifications,
      recommendations,
      grades,
    ] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId },
        select: {
          course: {
            select: { id: true, name: true, code: true },
          },
        },
      }),

      prisma.attendance.count({
        where: { studentId, status: "PRESENT" },
      }),

      prisma.examResult.count({
        where: { studentId },
      }),

      prisma.assignmentSubmission.count({
        where: { studentId },
      }),

      prisma.attendance.findMany({
        where: { studentId },
        take: 8,
        orderBy: { date: "desc" },
        include: { course: { select: { name: true } } },
      }),

      prisma.assignment.findMany({
        where: {
          course: { students: { some: { studentId } } },
        },
        take: 5,
        orderBy: { dueDate: "asc" },
        select: {
          id: true,
          title: true,
          dueDate: true,
          course: { select: { name: true } },
        },
      }),

      // Fetch received notifications
      prisma.systemNotification.findMany({
        where: { receiverId: studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { sender: { select: { name: true, role: true } } },
      }),

      // Fetch advisor recommendations
      prisma.advisorRecommendation.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { advisor: { select: { name: true } } },
      }),

      // Fetch exam grades
      prisma.examResult.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          exam: {
            select: {
              title: true,
              course: { select: { name: true, code: true } },
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        courses: enrollments.length,
        attendance: attendanceCount,
        exams: examResultsCount,
        assignments: assignmentsCount,
      },

      courses: enrollments.map((item) => ({
        id: item.course.id,
        name: item.course.name,
        code: item.course.code,
      })),

      recentAttendance: recentAttendance.map((item) => ({
        id: item.id,
        course: item.course?.name || "-",
        status: item.status,
        createdAt: item.date.toISOString(),
      })),

      exams: upcomingAssignments.map((item) => ({
        id: item.id,
        title: item.title,
        course: item.course.name,
        dueDate: item.dueDate.toISOString(),
      })),

      notifications: notifications.map((n) => ({
        id: n.id,
        message: n.message,
        isRead: n.isRead,
        senderName: n.sender.name || "النظام",
        senderRole: n.sender.role,
        createdAt: n.createdAt.toISOString(),
      })),

      recommendations: recommendations.map((r) => ({
        id: r.id,
        text: r.text,
        isWarning: r.isWarning,
        advisorName: r.advisor.name || "المرشد",
        createdAt: r.createdAt.toISOString(),
      })),

      grades: grades.map((g) => ({
        id: g.id,
        examTitle: g.exam.title,
        courseName: g.exam.course.name,
        courseCode: g.exam.course.code,
        score: g.score,
        createdAt: g.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Student Dashboard Error:", error);

    return {
      stats: { courses: 0, attendance: 0, exams: 0, assignments: 0 },
      courses: [],
      recentAttendance: [],
      exams: [],
      notifications: [],
      recommendations: [],
      grades: [],
    };
  }
}