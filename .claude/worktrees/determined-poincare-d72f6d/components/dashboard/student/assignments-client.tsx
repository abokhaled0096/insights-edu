"use client";

// components/dashboard/student/assignments-page.tsx

import {
  Card,
  Tag,
  Empty,
  Button,
} from "antd";

import {
  FileText,
  Clock3,
  CheckCircle,
  Download,
} from "lucide-react";

import { format } from "date-fns";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;

  course: {
    id: string;
    name: string;
    code: string;
  };

  submission: {
    id: string;
    fileUrl: string | null;
    grade: number | null;
    status: string;
    submittedAt: string | null;
  } | null;
};

type Props = {
  assignments: Assignment[];
};

export default function StudentAssignmentsPage({
  assignments,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          الواجبات
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          متابعة الواجبات
          والتسليمات
        </p>
      </div>

      {assignments.length ===
      0 ? (
        <Card className="rounded-2xl shadow-sm">
          <Empty description="لا توجد واجبات حالياً" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {assignments.map(
            (
              item
            ) => {
              const submitted =
                !!item.submission;

              const isLate =
                new Date() >
                  new Date(
                    item.dueDate
                  ) &&
                !submitted;

              return (
                <Card
                  key={
                    item.id
                  }
                  className="rounded-2xl shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText
                          size={
                            18
                          }
                        />

                        <h3 className="font-bold text-lg">
                          {
                            item.title
                          }
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {
                          item.course
                            .name
                        }{" "}
                        (
                        {
                          item.course
                            .code
                        }
                        )
                      </p>
                    </div>

                    {/* Desc */}
                    {item.description && (
                      <p className="text-sm text-slate-600">
                        {
                          item.description
                        }
                      </p>
                    )}

                    {/* Due Date */}
                    <div className="text-sm">
                      موعد التسليم:
                      {" "}
                      <span className="font-medium">
                        {format(
                          new Date(
                            item.dueDate
                          ),
                          "yyyy-MM-dd HH:mm"
                        )}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-wrap gap-2">
                      {submitted ? (
                        <Tag color="green">
                          <CheckCircle
                            size={
                              13
                            }
                          />{" "}
                          {
                            item
                              .submission
                              ?.status
                          }
                        </Tag>
                      ) : isLate ? (
                        <Tag color="red">
                          متأخر
                        </Tag>
                      ) : (
                        <Tag color="orange">
                          <Clock3
                            size={
                              13
                            }
                          />{" "}
                          لم يسلم
                        </Tag>
                      )}

                      {item
                        .submission
                        ?.grade !==
                        null &&
                        item
                          .submission && (
                          <Tag color="blue">
                            الدرجة:
                            {" "}
                            {
                              item
                                .submission
                                .grade
                            }
                          </Tag>
                        )}
                    </div>

                    {/* Submission Date */}
                    {item
                      .submission
                      ?.submittedAt && (
                      <div className="text-xs text-slate-500">
                        تم التسليم:
                        {" "}
                        {format(
                          new Date(
                            item
                              .submission
                              .submittedAt
                          ),
                          "yyyy-MM-dd HH:mm"
                        )}
                      </div>
                    )}

                    {/* File */}
                    {item
                      .submission
                      ?.fileUrl && (
                      <a
                        href={
                          item
                            .submission
                            .fileUrl
                        }
                        target="_blank"
                      >
                        <Button
                          icon={
                            <Download
                              size={
                                15
                              }
                            />
                          }
                        >
                          الملف المرفوع
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}