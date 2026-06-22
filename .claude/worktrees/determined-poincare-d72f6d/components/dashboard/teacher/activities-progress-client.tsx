"use client";

// components/dashboard/teacher/activities-progress-page.tsx

import {
  Card,
  Collapse,
  Table,
  Tag,
  Progress,
  Empty,
} from "antd";

import { format } from "date-fns";

type Props = {
  activities: {
    id: string;
    title: string;
    type: string;
    points: number;
    dueDate: string | null;
    createdAt: string;

    course: {
      id: string;
      name: string;
      code: string;
    };

    students: {
      id: string;
      name: string | null;
      code: string | null;
      progress: number;
      status: string;
    }[];
  }[];
};

export default function TeacherActivitiesProgressPage({
  activities,
}: Props) {
  if (
    activities.length ===
    0
  ) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <Empty description="لا توجد أنشطة حالياً" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          تقدم الطلاب
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          متابعة تقدم الطلاب
          في الأنشطة
        </p>
      </div>

      <Collapse
        accordion
        items={activities.map(
          (
            activity
          ) => ({
            key: activity.id,

            label: (
              <div className="flex flex-wrap gap-3 items-center">
                <span className="font-semibold">
                  {
                    activity.title
                  }
                </span>

                <Tag color="blue">
                  {
                    activity.type
                  }
                </Tag>

                <Tag color="purple">
                  {
                    activity.course
                      .name
                  }
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
            ),

            children: (
              <Table
                rowKey="id"
                pagination={
                  false
                }
                dataSource={
                  activity.students
                }
                columns={[
                  {
                    title:
                      "الطالب",
                    dataIndex:
                      "name",
                  },

                  {
                    title:
                      "الكود",
                    dataIndex:
                      "code",
                  },

                  {
                    title:
                      "الحالة",
                    dataIndex:
                      "status",
                    render: (
                      value
                    ) => (
                      <Tag
                        color={
                          value ===
                          "DONE"
                            ? "green"
                            : "orange"
                        }
                      >
                        {
                          value
                        }
                      </Tag>
                    ),
                  },

                  {
                    title:
                      "التقدم",
                    dataIndex:
                      "progress",
                    render: (
                      value
                    ) => (
                      <Progress
                        percent={
                          value
                        }
                        size="small"
                      />
                    ),
                  },
                ]}
              />
            ),
          })
        )}
      />
    </div>
  );
}