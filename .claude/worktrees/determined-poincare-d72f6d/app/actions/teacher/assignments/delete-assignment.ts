"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function deleteAssignment(assignmentId: string) {
    const teacher = (await auth())?.user
    if (!teacher) return

    await prisma.assignment.deleteMany({
        where: {
            id: assignmentId,
            teacherId: teacher.id,
        }
    })
}