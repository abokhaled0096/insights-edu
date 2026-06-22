"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/client";

export async function createAssignment({data}:{data:any}) {
    const session = await auth()
    
  if (!session) return [];
  if (session.user.role !== Role.TEACHER) return [];
    const {title, description, courseId, dueDate} = data
  const result = await prisma.assignment.create({
    data:{
        title,
        description,
        courseId,
        dueDate,
        teacherId:session.user.id
    }
  })
}