"use client";

import {
  Card,
  Tag,
  Empty,
  Row,
  Col,
  Progress,
} from "antd";

import {
  ClipboardList,
  BookOpen,
  FileText,
  Calendar,
  Trophy,
} from "lucide-react";

import { format } from "date-fns";

type Props = {
  activities: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    points: number;
    dueDate: string | null;
    createdAt: string;

    course: {
      id: string;
      name: string;
      code: string;
    };
  }[];

  stats: {
    total: number;
    tasks: number;
    quizzes: number;
    projects: number;
    exams: number;
    events: number;
  };
};

export default function StudentActivitiesPage({
  activities,
  stats,
}: Props) {
  const getColor = (
    type: string
  ) => {
    switch (type) {
      case "TASK":
        return "green";
      case "QUIZ":
        return "blue";
      case "PROJECT":
        return "purple";
      case "EXAM":
        return "red";
      default:
        return "orange";
    }
  };

  const getIcon = (
    type: string
  ) => {
    switch (type) {
      case "QUIZ":
        return (
          <ClipboardList size={18} />
        );

      case "PROJECT":
        return (
          <BookOpen size={18} />
        );

      case "EXAM":
        return (
          <FileText size={18} />
        );

      default:
        return (
          <Calendar size={18} />
        );
    }
  };

  const progress =
    stats.total
      ? Math.round(
          ((stats.tasks +
            stats.quizzes +
            stats.projects +
            stats.exams +
            stats.events) /
            stats.total) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          الأنشطة
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          جميع الأنشطة
          الخاصة بك
        </p>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">
              إجمالي الأنشطة
            </div>

            <div className="text-2xl font-bold mt-2">
              {stats.total}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">
              النقاط
            </div>

            <div className="text-2xl font-bold mt-2 flex gap-2 items-center">
              <Trophy size={18} />
              {activities.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  item.points,
                0
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500 mb-2">
              الإنجاز
            </div>

            <Progress
              percent={
                progress
              }
            />
          </Card>
        </Col>
      </Row>

      {/* List */}
      {activities.length ===
      0 ? (
        <Card className="rounded-2xl shadow-sm">
          <Empty description="لا توجد أنشطة حالياً" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activities.map(
            (
              item
            ) => (
              <Card
                key={
                  item.id
                }
                className="rounded-2xl shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-2">
                      {getIcon(
                        item.type
                      )}

                      <div>
                        <div className="font-bold text-lg">
                          {
                            item.title
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {format(
                            new Date(
                              item.createdAt
                            ),
                            "yyyy-MM-dd"
                          )}
                        </div>
                      </div>
                    </div>

                    <Tag
                      color={getColor(
                        item.type
                      )}
                    >
                      {
                        item.type
                      }
                    </Tag>
                  </div>

                  <div className="text-sm text-slate-500">
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
                  </div>

                  {item.description && (
                    <p className="text-sm text-slate-600">
                      {
                        item.description
                      }
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <Tag color="gold">
                      {
                        item.points
                      }{" "}
                      نقطة
                    </Tag>

                    {item.dueDate && (
                      <Tag color="cyan">
                        {format(
                          new Date(
                            item.dueDate
                          ),
                          "yyyy-MM-dd"
                        )}
                      </Tag>
                    )}
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}