import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const notifications = await prisma.systemNotification.findMany({
      where: { receiverId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { sender: { select: { name: true, role: true } } },
    });
    const unreadCount = await prisma.systemNotification.count({
      where: { receiverId: session.user.id, isRead: false },
    });
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = session.user.role;
    if (role !== "TEACHER" && role !== "ADVISOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { receiverId, message } = body;
    if (!receiverId || !message) return NextResponse.json({ error: "receiverId and message required" }, { status: 400 });
    const notification = await prisma.systemNotification.create({
      data: { senderId: session.user.id, receiverId, message },
    });
    return NextResponse.json({ success: true, notification });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { notificationId } = body;
    if (notificationId) {
      await prisma.systemNotification.update({
        where: { id: notificationId, receiverId: session.user.id },
        data: { isRead: true },
      });
    } else {
      await prisma.systemNotification.updateMany({
        where: { receiverId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
