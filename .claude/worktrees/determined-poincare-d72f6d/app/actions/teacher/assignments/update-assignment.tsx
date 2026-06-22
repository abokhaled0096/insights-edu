"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/lib/generated/prisma/enums";

export async function updateAssignment(assignmentId: string, title: string, description: string) {
    const session = await auth();

    if (!session) return;
    if (session.user.role !== Role.TEACHER) return;

    await prisma.assignment.updateMany({
        where: {
            id: assignmentId,
            teacherId: session.user.id,
        },
        data: {
            title,
            description,
        },
    });
}