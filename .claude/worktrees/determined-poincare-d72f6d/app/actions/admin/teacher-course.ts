"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignTeacherCourse(data: {
  teacherId: string;
  courseId: string;
}) {
  await prisma.teacherCourse.create({
    data,
  });

  revalidatePath(`/admin/teachers/${data.teacherId}/courses`);
}