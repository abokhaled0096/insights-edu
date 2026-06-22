"use client";

// components/dashboard/admin/reports-page.tsx

import { Card, Table, Tag } from "antd";
import { format } from "date-fns";

type Props = {
  data: {
    stats: {
      studentsCount: number;
      teachersCount: number;
      coursesCount: number;
      attendanceCount: number;
      adminCount: number;
    };

    latestStudents: {
      id: string;
      name: string | null;
      email: string;
    }[];

    latestTeachers: {
      id: string;
      name: string | null;
      email: string;
    }[];

    recentAttendances: {
      id: string;
      student: string;
      code: string;
      course: string;
      createdAt: string | null;
    }[];
  };
};

export default function ReportsPage({
  data,
}: Props) {
  const statCards = [
    {
      title:
        "إجمالي الطلاب",
      value:
        data.stats
          .studentsCount,
    },

    {
      title:
        "إجمالي المدرسين",
      value:
        data.stats
          .teachersCount,
    },

    {
      title:
        "إجمالي الكورسات",
      value:
        data.stats
          .coursesCount,
    },

    {
      title:
        "سجلات الحضور",
      value:
        data.stats
          .attendanceCount,
    },

    {
      title:
        "الأدمنز",
      value:
        data.stats
          .adminCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          التقارير
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          إحصائيات عامة
          وتقارير النظام
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map(
          (item) => (
            <Card
              key={
                item.title
              }
              className="rounded-2xl shadow-sm"
            >
              <div className="text-sm text-slate-500">
                {
                  item.title
                }
              </div>

              <div className="text-2xl font-bold text-slate-800 mt-2">
                {
                  item.value
                }
              </div>
            </Card>
          )
        )}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card
          title="آخر الطلاب"
          className="rounded-2xl shadow-sm"
        >
          <div className="space-y-3">
            {data.latestStudents.map(
              (
                student
              ) => (
                <div
                  key={
                    student.id
                  }
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {student.name ||
                        "بدون اسم"}
                    </div>

                    <div className="text-xs text-slate-500">
                      {
                        student.email
                      }
                    </div>
                  </div>

                  <Tag color="blue">
                    طالب
                  </Tag>
                </div>
              )
            )}
          </div>
        </Card>

        <Card
          title="آخر المدرسين"
          className="rounded-2xl shadow-sm"
        >
          <div className="space-y-3">
            {data.latestTeachers.map(
              (
                teacher
              ) => (
                <div
                  key={
                    teacher.id
                  }
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {teacher.name ||
                        "بدون اسم"}
                    </div>

                    <div className="text-xs text-slate-500">
                      {
                        teacher.email
                      }
                    </div>
                  </div>

                  <Tag color="purple">
                    مدرس
                  </Tag>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card
        title="آخر سجلات الحضور"
        className="rounded-2xl shadow-sm"
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={
            data.recentAttendances
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
                "الوقت",
              dataIndex:
                "createdAt",
              render: (
                value
              ) => {
                if (!value) return "-";
                const date = new Date(value);
                if (isNaN(date.getTime()))
                  return "-";
                return format(
                  date,
                  "yyyy-MM-dd HH:mm"
                );
              },
            },
          ]}
        />
      </Card>
    </div>
  );
}