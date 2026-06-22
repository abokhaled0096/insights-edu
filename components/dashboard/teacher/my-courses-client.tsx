"use client";

// components/dashboard/teacher/my-courses-page.tsx

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Card,
  Input,
  Table,
  Button,
  Tag,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import {
  Search,
  Eye,
  Users,
} from "lucide-react";

import { format } from "date-fns";

type CourseItem = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  studentsCount: number;
};

type Props = {
  courses: CourseItem[];
};

export default function MyCoursesPage({
  courses,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filteredCourses =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return courses.filter(
        (course) =>
          course.name
            .toLowerCase()
            .includes(q) ||
          course.code
            .toLowerCase()
            .includes(q)
      );
    }, [search, courses]);

  const totalStudents =
    courses.reduce(
      (sum, course) =>
        sum +
        course.studentsCount,
      0
    );

  const columns: ColumnsType<CourseItem> =
    [
      {
        title: "الكورس",
        key: "course",
        render: (
          _,
          course
        ) => (
          <div>
            <div className="font-semibold text-slate-800">
              {course.name}
            </div>

            <div className="text-xs text-slate-500 mt-1">
              {course.code}
            </div>
          </div>
        ),
      },

      {
        title: "الطلاب",
        dataIndex:
          "studentsCount",
        key:
          "studentsCount",
        align:
          "center",
        render: (
          count
        ) => (
          <Tag color="blue">
            {count} طالب
          </Tag>
        ),
      },

      {
        title:
          "تاريخ الإنشاء",
        dataIndex:
          "createdAt",
        key:
          "createdAt",
        responsive: [
          "lg",
        ],
        render: (
          value
        ) =>
          format(
            new Date(
              value
            ),
            "yyyy-MM-dd"
          ),
      },

      {
        title: "",
        key:
          "actions",
        width: 90,
        render: (
          _,
          course
        ) => (
          <Link
            href={`/teacher/courses/${course.id}`}
          >
            <Button
              type="link"
              icon={
                <Eye
                  size={
                    15
                  }
                />
              }
            >
              عرض
            </Button>
          </Link>
        ),
      },
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          كورساتي
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          جميع الكورسات
          المرتبطة بك
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            عدد الكورسات
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              courses.length
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي الطلاب
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Users size={18} />
            {
              totalStudents
            }
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <div className="mb-5">
          <Input
            size="large"
            placeholder="ابحث باسم الكورس أو الكود..."
            prefix={
              <Search
                size={
                  16
                }
              />
            }
            value={
              search
            }
            onChange={(
              e
            ) =>
              setSearch(
                e.target
                  .value
              )
            }
            className="max-w-md"
          />
        </div>

        <Table
          rowKey="id"
          columns={
            columns
          }
          dataSource={
            filteredCourses
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{
            x: 900,
          }}
        />
      </Card>
    </div>
  );
}