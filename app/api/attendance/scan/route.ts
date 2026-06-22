
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const studentCode = body.studentCode?.trim();

    if (!studentCode) {
      return NextResponse.json(
        { success: false, message: "studentCode required" },
        { status: 400 }
      );
    }

    // ==========================
    // 1. Find Student
    // ==========================
    const student = await prisma.user.findUnique({
      where: {
        studentCode: studentCode
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // ==========================
    // 2. Find Active Session (with expiration check)
    // ==========================
    const session = await prisma.attendanceSession.findFirst({
      where: {
        active: true
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "No active attendance session" },
        { status: 400 }
      );
    }

    // Auto-expire sessions past their 15-minute window
    if (session.expiresAt && new Date() > session.expiresAt) {
      await prisma.attendanceSession.update({
        where: { id: session.id },
        data: { active: false, endedAt: session.expiresAt },
      });
      return NextResponse.json(
        { success: false, message: "Attendance session has expired" },
        { status: 400 }
      );
    }

    // ==========================
    // 3. Prevent duplicate today
    // ==========================
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        sessionId: session.id
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Attendance already recorded" },
        { status: 400 }
      );
    }

    // ==========================
    // 4. Call Python Face Server
    // ==========================
    const mockFaceHeader = req.headers.get("X-Mock-Face") || (process.env.MOCK_FACE === "true" ? "true" : "false");
    const flaskApiUrl = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

    const faceResponse = await fetch(`${flaskApiUrl}/verify-face`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mock-Face": mockFaceHeader
      },
      body: JSON.stringify({
        studentCode: studentCode
      })
    });

    const faceData = await faceResponse.json();

    if (!faceData.success) {
      return NextResponse.json(
        { success: false, message: "Face verification failed" },
        { status: 401 }
      );
    }

    if (faceData.studentCode !== studentCode) {
      return NextResponse.json(
        { success: false, message: "Face mismatch" },
        { status: 401 }
      );
    }

    // ==========================
    // 5. Save Attendance
    // ==========================
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        courseId: session.courseId,
        sessionId: session.id,
        cardId: studentCode,
        faceMatched: true,
        status: "PRESENT"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully",
      student: student.name,
      attendanceId: attendance.id
    });

  } catch (error: any) {
    console.error("API error details:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
