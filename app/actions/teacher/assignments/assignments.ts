"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

async function requireTeacher() {
  const session = await auth();

  if (!session || (session.user.role !== Role.TEACHER && session.user.role !== Role.TA)) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/* -------------------------------------------------------------------------- */
/*                              Get All Assignments                           */
/* -------------------------------------------------------------------------- */

export async function getTeacherAssignments() {
  const user = await requireTeacher();

  return await prisma.assignment.findMany({
    where: {
      teacherId: user.id,
    },
    include: {
      course: true,
      submissions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                            Get Single Assignment                           */
/* -------------------------------------------------------------------------- */

export async function getTeacherAssignmentById(id: string) {
  const user = await requireTeacher();

  return await prisma.assignment.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
    include: {
      course: true,
      submissions: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                              Create Assignment                             */
/* -------------------------------------------------------------------------- */

type CreateAssignmentInput = {
  title: string;
  description?: string;
  attachmentUrl?: string;
  dueDate: Date;
  courseId: string;
};

export async function createAssignment(data: CreateAssignmentInput) {
  const user = await requireTeacher();

  const assignment = await prisma.assignment.create({
    data: {
      title: data.title,
      description: data.description,
      attachmentUrl: data.attachmentUrl,
      dueDate: data.dueDate,
      courseId: data.courseId,
      teacherId: user.id,
    },
  });

  revalidatePath("/teacher/assignments");

  return assignment;
}

/* -------------------------------------------------------------------------- */
/*                              Update Assignment                             */
/* -------------------------------------------------------------------------- */

type UpdateAssignmentInput = {
  id: string;
  title?: string;
  description?: string;
  attachmentUrl?: string;
  dueDate?: Date;
};

export async function updateAssignment(data: UpdateAssignmentInput) {
  const user = await requireTeacher();

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: data.id,
      teacherId: user.id,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const updated = await prisma.assignment.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      description: data.description,
      attachmentUrl: data.attachmentUrl,
      dueDate: data.dueDate,
    },
  });

  revalidatePath("/teacher/assignments");

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                              Delete Assignment                             */
/* -------------------------------------------------------------------------- */

export async function deleteAssignment(id: string) {
  const user = await requireTeacher();

  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  await prisma.assignment.delete({
    where: {
      id,
    },
  });

  revalidatePath("/teacher/assignments");

  return { success: true };
}
export async function getTeacherCourses() {
  const user = await requireTeacher();

  const teacherCourses = await prisma.teacherCourse.findMany({
    where: {
      teacherId: user.id,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      course: {
        createdAt: "desc",
      },
    },
  });

  return teacherCourses.map((item) => item.course);
}