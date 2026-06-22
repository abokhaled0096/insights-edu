"use client";

// components/dashboard/student/assignment-submit-page.tsx

import { useState } from "react";

import {
  Card,
  Upload,
  Button,
  message,
  Tag,
  Progress,
} from "antd";

import type { UploadFile } from "antd/es/upload/interface";

import {
  UploadCloud,
  FileText,
} from "lucide-react";

import { format } from "date-fns";

type Props = {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;

    course: {
      name: string;
      code: string;
    };

    submission: {
      fileUrl: string | null;
      submittedAt: string | null;
      status: string;
      grade: number | null;
    } | null;
  };
};

export default function AssignmentSubmitPage({
  assignment,
}: Props) {
  const [fileList, setFileList] =
    useState<UploadFile[]>(
      []
    );

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [msgApi, contextHolder] =
    message.useMessage();

  const submit =
    async () => {
      const file =
        fileList[0]
          ?.originFileObj;

      if (!file) {
        msgApi.warning(
          "اختر ملف أولاً"
        );
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "assignmentId",
        assignment.id
      );

      setLoading(true);

      const xhr =
        new XMLHttpRequest();

      xhr.open(
        "POST",
        "/api/assignments/upload"
      );

      xhr.upload.onprogress =
        (event) => {
          if (
            event.lengthComputable
          ) {
            const percent =
              Math.round(
                (event.loaded /
                  event.total) *
                  100
              );

            setProgress(
              percent
            );
          }
        };

      xhr.onload =
        () => {
          setLoading(
            false
          );

          if (
            xhr.status ===
            200
          ) {
            msgApi.success(
              "تم التسليم بنجاح"
            );

            window.location.reload();
          } else {
            msgApi.error(
              "فشل التسليم"
            );
          }
        };

      xhr.send(
        formData
      );
    };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {contextHolder}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          تسليم الواجب
        </h1>

        <p className="text-slate-500 mt-1">
          رفع ملف
          الواجب
        </p>
      </div>

      {/* Info */}
      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-3">
          <div className="text-xl font-semibold">
            {
              assignment.title
            }
          </div>

          <div className="text-sm text-slate-500">
            {
              assignment
                .course
                .name
            }{" "}
            (
            {
              assignment
                .course
                .code
            }
            )
          </div>

          {assignment.description && (
            <p className="text-slate-600">
              {
                assignment.description
              }
            </p>
          )}

          <Tag color="blue">
            آخر موعد:
            {" "}
            {format(
              new Date(
                assignment.dueDate
              ),
              "yyyy-MM-dd HH:mm"
            )}
          </Tag>
        </div>
      </Card>

      {/* Current Submission */}
      {assignment.submission && (
        <Card className="rounded-2xl shadow-sm">
          <div className="space-y-3">
            <Tag color="green">
              تم التسليم مسبقاً
            </Tag>

            <div>
              التاريخ:
              {" "}
              {assignment
                .submission
                .submittedAt &&
                format(
                  new Date(
                    assignment
                      .submission
                      .submittedAt
                  ),
                  "yyyy-MM-dd HH:mm"
                )}
            </div>

            {assignment
              .submission
              .grade !==
              null && (
              <Tag color="purple">
                الدرجة:
                {" "}
                {
                  assignment
                    .submission
                    .grade
                }
              </Tag>
            )}

            {assignment
              .submission
              .fileUrl && (
              <a
                href={
                  assignment
                    .submission
                    .fileUrl
                }
                target="_blank"
              >
                <Button>
                  الملف الحالي
                </Button>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Upload */}
      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-5">
          <Upload
            beforeUpload={() =>
              false
            }
            maxCount={1}
            fileList={
              fileList
            }
            onChange={({
              fileList,
            }) =>
              setFileList(
                fileList
              )
            }
          >
            <Button
              icon={
                <UploadCloud
                  size={
                    16
                  }
                />
              }
            >
              اختر ملف
            </Button>
          </Upload>

          <p className="text-xs text-slate-500">
            PDF / DOCX /
            ZIP / PNG /
            JPG
          </p>

          {loading && (
            <Progress
              percent={
                progress
              }
            />
          )}

          <Button
            type="primary"
            size="large"
            loading={
              loading
            }
            icon={
              <FileText
                size={
                  16
                }
              />
            }
            onClick={
              submit
            }
          >
            {assignment.submission
              ? "تحديث التسليم"
              : "تسليم الواجب"}
          </Button>
        </div>
      </Card>
    </div>
  );
}