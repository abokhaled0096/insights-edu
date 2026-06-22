"use client";

import { useState } from "react";

import {
  Card,
  Table,
  Select,
  Button,
  Tag,
  message,
} from "antd";

import {
  PlayCircle,
  StopCircle,
} from "lucide-react";

import { format } from "date-fns";

import {
  createAttendanceSessionAction,
  endAttendanceSessionAction,
} from "@/app/actions/teacher/attendance";

type Props = {
  data: {
    courses: {
      id: string;
      name: string;
      code: string;
    }[];

    activeSession: {
      id: string;
      startedAt: string;
      course: string;
    } | null;

    records: {
      id: string;
      student: string;
      code: string;
      course: string;
      sessionId: string;
      status: string;
      createdAt: string;
    }[];
  };
};

export default function TeacherAttendancePage({
  data,
}: Props) {
  const [courseId, setCourseId] =
    useState<string>();

  const [loading, setLoading] =
    useState(false);

  const [msgApi, contextHolder] =
    message.useMessage();

  const startSession =
    async () => {
      if (!courseId) {
        msgApi.warning(
          "اختر كورس"
        );
        return;
      }

      setLoading(true);

      const res =
        await createAttendanceSessionAction(
          courseId
        );

      res.success
        ? msgApi.success(
            res.message
          )
        : msgApi.error(
            res.message
          );

      setLoading(false);
    };

  const endSession =
    async () => {
      setLoading(true);

      const res =
        await endAttendanceSessionAction();

      res.success
        ? msgApi.success(
            res.message
          )
        : msgApi.error(
            res.message
          );

      setLoading(false);
    };

  return (
    <div className="space-y-6">
      {contextHolder}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          الحضور
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          إدارة جلسات
          الحضور وعرض
          السجلات
        </p>
      </div>

      {/* Session */}
      <Card className="rounded-2xl shadow-sm">
        {data.activeSession ? (
          <div className="space-y-3">
            <Tag color="green">
              جلسة نشطة
            </Tag>

            <div>
              الكورس:
              {" "}
              {
                data
                  .activeSession
                  .course
              }
            </div>

            <div>
              بدأت:
              {" "}
              {format(
                new Date(
                  data
                    .activeSession
                    .startedAt
                ),
                "yyyy-MM-dd HH:mm"
              )}
            </div>

            <Button
              danger
              icon={
                <StopCircle
                  size={
                    16
                  }
                />
              }
              loading={
                loading
              }
              onClick={
                endSession
              }
            >
              إنهاء الجلسة
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              size="large"
              className="w-full"
              placeholder="اختر كورس"
              value={
                courseId
              }
              onChange={
                setCourseId
              }
              options={data.courses.map(
                (
                  course
                ) => ({
                  label: `${course.name} (${course.code})`,
                  value:
                    course.id,
                })
              )}
            />

            <Button
              type="primary"
              icon={
                <PlayCircle
                  size={
                    16
                  }
                />
              }
              loading={
                loading
              }
              onClick={
                startSession
              }
            >
              بدء جلسة حضور
            </Button>
          </div>
        )}
      </Card>

      {/* Records */}
      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          pagination={{
            pageSize: 10,
          }}
          dataSource={
            data.records
          }
          columns={[
            {
              title:
                "الطالب",
              dataIndex:
                "student",
            },

            {
              title:
                "الكود",
              dataIndex:
                "code",
            },

            {
              title:
                "الكورس",
              dataIndex:
                "course",
            },

            {
              title:
                "الحالة",
              dataIndex:
                "status",
              render: (
                status
              ) => (
                <Tag
                  color={
                    status ===
                    "PRESENT"
                      ? "green"
                      : status ===
                        "ABSENT"
                      ? "red"
                      : "orange"
                  }
                >
                  {
                    status
                  }
                </Tag>
              ),
            },

            {
              title:
                "Session",
              dataIndex:
                "sessionId",
            },

            {
              title:
                "الوقت",
              dataIndex:
                "createdAt",
              render: (
                value
              ) =>
                format(
                  new Date(
                    value
                  ),
                  "yyyy-MM-dd HH:mm"
                ),
            },
          ]}
        />
      </Card>
    </div>
  );
}