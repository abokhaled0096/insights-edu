"use client";

// components/dashboard/student/activity-content-page.tsx

import {
  Card,
  Tag,
  Empty,
  Button,
} from "antd";

import {
  FileText,
  Link2,
  Video,
  Code2,
  Image as ImageIcon,
  HelpCircle,
  Download,
} from "lucide-react";

import { format } from "date-fns";

type Props = {
  activity: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    points: number;
    dueDate: string | null;

    course: {
      name: string;
      code: string;
    };

    contents: {
      id: string;
      type: string;
      title: string | null;
      body: string | null;
      sortOrder: number;
    }[];

    attachments: {
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize: number | null;
    }[];

    submission: {
      score: number | null;
      feedback: string | null;
      status: string;
    } | null;
  };
};

export default function StudentActivityContentPage({
  activity,
}: Props) {
  const getIcon = (
    type: string
  ) => {
    switch (type) {
      case "LINK":
        return <Link2 size={18} />;

      case "VIDEO":
        return <Video size={18} />;

      case "CODE":
        return <Code2 size={18} />;

      case "IMAGE":
        return (
          <ImageIcon size={18} />
        );

      case "QUESTION":
        return (
          <HelpCircle size={18} />
        );

      default:
        return (
          <FileText size={18} />
        );
    }
  };

  const renderBody = (
    type: string,
    body: string | null
  ) => {
    if (!body) return null;

    if (type === "LINK") {
      return (
        <a
          href={body}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {body}
        </a>
      );
    }

    if (type === "IMAGE") {
      return (
        <img
          src={body}
          alt="content"
          className="rounded-xl max-h-80 object-cover"
        />
      );
    }

    if (type === "VIDEO") {
      return (
        <a
          href={body}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          مشاهدة الفيديو
        </a>
      );
    }

    if (type === "CODE") {
      return (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-auto text-sm">
          <code>
            {body}
          </code>
        </pre>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-slate-700 leading-7">
        {body}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Card className="rounded-2xl shadow-sm border-0">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-800">
            {
              activity.title
            }
          </h1>

          <div className="flex flex-wrap gap-2">
            <Tag color="blue">
              {
                activity.type
              }
            </Tag>

            <Tag color="purple">
              {
                activity.course
                  .name
              }{" "}
              (
              {
                activity.course
                  .code
              }
              )
            </Tag>

            <Tag color="gold">
              {
                activity.points
              }{" "}
              نقطة
            </Tag>

            {activity.dueDate && (
              <Tag color="cyan">
                {format(
                  new Date(
                    activity.dueDate
                  ),
                  "yyyy-MM-dd"
                )}
              </Tag>
            )}
          </div>

          {activity.description && (
            <p className="text-slate-600 leading-7">
              {
                activity.description
              }
            </p>
          )}
        </div>
      </Card>

      {/* Contents */}
      <Card className="rounded-2xl shadow-sm border-0">
        <h2 className="font-bold text-lg mb-5">
          محتوى النشاط
        </h2>

        {activity.contents
          .length === 0 ? (
          <Empty description="لا يوجد محتوى حالياً" />
        ) : (
          <div className="space-y-5">
            {activity.contents.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    {getIcon(
                      item.type
                    )}

                    <span className="font-semibold text-slate-800">
                      {index +
                        1}
                      .{" "}
                      {item.title ||
                        item.type}
                    </span>

                    <Tag color="blue">
                      {
                        item.type
                      }
                    </Tag>
                  </div>

                  {renderBody(
                    item.type,
                    item.body
                  )}
                </div>
              )
            )}
          </div>
        )}
      </Card>

      {/* Attachments */}
      <Card className="rounded-2xl shadow-sm border-0">
        <h2 className="font-bold text-lg mb-5">
          الملفات المرفقة
        </h2>

        {activity.attachments
          .length === 0 ? (
          <Empty description="لا توجد ملفات" />
        ) : (
          <div className="space-y-3">
            {activity.attachments.map(
              (
                file
              ) => (
                <div
                  key={
                    file.id
                  }
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-xl"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {
                        file.fileName
                      }
                    </div>

                    {file.fileSize && (
                      <div className="text-xs text-slate-500">
                        {(
                          file.fileSize /
                          1024
                        ).toFixed(
                          1
                        )}{" "}
                        KB
                      </div>
                    )}
                  </div>

                  <a
                    href={
                      file.fileUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      icon={
                        <Download
                          size={
                            16
                          }
                        />
                      }
                    >
                      تحميل
                    </Button>
                  </a>
                </div>
              )
            )}
          </div>
        )}
      </Card>

      {/* Submission */}
      <Card className="rounded-2xl shadow-sm border-0">
        <h2 className="font-bold text-lg mb-4">
          حالة التسليم
        </h2>

        {!activity.submission ? (
          <Tag color="orange">
            لم يتم التسليم بعد
          </Tag>
        ) : (
          <div className="space-y-3">
            <Tag color="green">
              {
                activity
                  .submission
                  .status
              }
            </Tag>

            {activity
              .submission
              .score !==
              null && (
              <div className="font-medium">
                الدرجة:{" "}
                {
                  activity
                    .submission
                    .score
                }
              </div>
            )}

            {activity
              .submission
              .feedback && (
              <div className="text-slate-600 leading-7">
                {
                  activity
                    .submission
                    .feedback
                }
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}