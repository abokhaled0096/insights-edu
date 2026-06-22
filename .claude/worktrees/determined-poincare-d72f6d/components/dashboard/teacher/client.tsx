"use client";

// components/dashboard/teacher/dashboard-page.tsx

import {
  Card,
  Table,
  Tag,
} from "antd";

import {
  BookOpen,
  Users,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

import { format } from "date-fns";

type Props = {
  data: {
    stats: {
      courses: number;
      students: number;
      todayAttendance: number;
      activeSession: number;
    };

    courses: {
      id: string;
      name: string;
      code: string;
      students: number;
    }[];

    recentAttendance: {
      id: string;
      student: string;
      code: string;
      course: string;
      createdAt: string;
    }[];
  };
};

export default function TeacherDashboardPage({
  data,
}: Props) {
  const cards = [
    {
      title:
        "كورساتي",
      value:
        data.stats
          .courses,
      icon: (
        <BookOpen
          size={18}
        />
      ),
    },

    {
      title:
        "طلابي",
      value:
        data.stats
          .students,
      icon: (
        <Users
          size={18}
        />
      ),
    },

    {
      title:
        "حضور اليوم",
      value:
        data.stats
          .todayAttendance,
      icon: (
        <CheckCircle
          size={18}
        />
      ),
    },

    {
      title:
        "جلسة نشطة",
      value:
        data.stats
          .activeSession,
      icon: (
        <PlayCircle
          size={18}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          لوحة المدرس
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          ملخص سريع
          وإحصائيات
          اليوم
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(
          (card) => (
            <Card
              key={
                card.title
              }
              className="rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-500">
                    {
                      card.title
                    }
                  </div>

                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {
                      card.value
                    }
                  </div>
                </div>

                <div className="text-slate-500">
                  {
                    card.icon
                  }
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Courses */}
      <Card
        title="كورساتي"
        className="rounded-2xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.courses.map(
            (
              course
            ) => (
              <Card
                key={
                  course.id
                }
                size="small"
              >
                <div className="font-semibold">
                  {
                    course.name
                  }
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  {
                    course.code
                  }
                </div>

                <Tag
                  color="blue"
                  className="mt-3"
                >
                  {
                    course.students
                  }{" "}
                  طالب
                </Tag>
              </Card>
            )
          )}
        </div>
      </Card>

      {/* Recent Attendance */}
      <Card
        title="آخر الحضور"
        className="rounded-2xl shadow-sm"
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={
            data.recentAttendance
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