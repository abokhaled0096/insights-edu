// app/api/upload-assignment/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  writeFile,
  mkdir,
} from "fs/promises";

import path from "path";

export async function POST(
  req: Request
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await req.formData();

    const file =
      formData.get(
        "file"
      ) as File;

    const assignmentId =
      formData.get(
        "assignmentId"
      ) as string;

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(
        bytes
      );

    const uploadDir =
      path.join(
        process.cwd(),
        "public/uploads/assignments"
      );

    await mkdir(
      uploadDir,
      {
        recursive:
          true,
      }
    );

    const fileName =
      `${session.user.id}-${Date.now()}-${file.name}`;

    const filePath =
      path.join(
        uploadDir,
        fileName
      );

    await writeFile(
      filePath,
      buffer
    );

    const url =
      `/uploads/assignments/${fileName}`;

    await prisma.assignmentSubmission.upsert(
      {
        where: {
          assignmentId_studentId:
            {
              assignmentId,
              studentId:
                session
                  .user.id,
            },
        },

        create: {
          assignmentId,
          studentId:
            session
              .user.id,
          fileUrl: url,
          status:
            "SUBMITTED",
          submittedAt:
            new Date(),
        },

        update: {
          fileUrl: url,
          status:
            "SUBMITTED",
          submittedAt:
            new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
      }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}