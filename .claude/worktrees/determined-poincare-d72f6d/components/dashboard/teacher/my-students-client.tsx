"use client";

// components/dashboard/teacher/my-students-page.tsx

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Card,
  Table,
  Input,
  Tag,
  Avatar,
  Button,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import {
  Search,
  Eye,
  Users,
} from "lucide-react";

import { format } from "date-fns";

type StudentItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  studentCode: string | null;
  createdAt: string;
  coursesCount: number;
  attendancesCount: number;

  courses: {
    id: string;
    name: string;
    code: string;
  }[];
};

type Props = {
  students: StudentItem[];
};

export default function MyStudentsPage({
  students,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filteredStudents =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return students.filter(
        (student) =>
          student.name
            ?.toLowerCase()
            .includes(q) ||
          student.email
            .toLowerCase()
            .includes(q) ||
          student.studentCode
            ?.toLowerCase()
            .includes(q)
      );
    }, [search, students]);

  const totalAttendance =
    students.reduce(
      (sum, student) =>
        sum +
        student.attendancesCount,
      0
    );

  const columns: ColumnsType<StudentItem> =
    [
      {
        title: "الطالب",
        key: "student",
        render: (
          _,
          student
        ) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={
                student.image ||
                undefined
              }
              className="bg-indigo-500"
            >
              {student.name?.charAt(
                0
              ) || "S"}
            </Avatar>

            <div>
              <div className="font-semibold text-slate-800">
                {student.name ||
                  "بدون اسم"}
              </div>

              <div className="text-xs text-slate-500">
                {
                  student.email
                }
              </div>
            </div>
          </div>
        ),
      },

      {
        title:
          "الكود",
        dataIndex:
          "studentCode",
        key:
          "studentCode",
        render: (
          code
        ) => (
          <Tag color="blue">
            {code ||
              "غير متوفر"}
          </Tag>
        ),
      },

      {
        title:
          "الكورسات",
        key:
          "courses",
        render: (
          _,
          student
        ) => (
          <div className="space-y-1">
            <Tag color="purple">
              {
                student.coursesCount
              }{" "}
              كورس
            </Tag>

            <div className="flex flex-wrap gap-1 max-w-65">
              {student.courses
                .slice(
                  0,
                  2
                )
                .map(
                  (
                    course
                  ) => (
                    <Tag
                      key={
                        course.id
                      }
                    >
                      {
                        course.name
                      }
                    </Tag>
                  )
                )}

              {student
                .coursesCount >
                2 && (
                <Tag>
                  +
                  {student.coursesCount -
                    2}
                </Tag>
              )}
            </div>
          </div>
        ),
      },

      {
        title:
          "الحضور",
        dataIndex:
          "attendancesCount",
        key:
          "attendancesCount",
        align:
          "center",
        render: (
          count
        ) => (
          <Tag color="green">
            {count}
          </Tag>
        ),
      },

      {
        title:
          "التسجيل",
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
          student
        ) => (
          <Link
            href={`/teacher/students/${student.id}/insight`}
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
          الطلاب
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          جميع الطلاب
          المرتبطين
          بكورساتك
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            عدد الطلاب
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              students.length
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي الحضور
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              totalAttendance
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            متوسط الكورسات
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Users size={18} />
            {students.length
              ? (
                  students.reduce(
                    (
                      sum,
                      student
                    ) =>
                      sum +
                      student.coursesCount,
                    0
                  ) /
                  students.length
                ).toFixed(
                  1
                )
              : 0}
          </div>
        </Card>
      </div>

      {/* Search + Table */}
      <Card className="rounded-2xl shadow-sm">
        <div className="mb-5">
          <Input
            size="large"
            placeholder="ابحث باسم الطالب أو الكود أو البريد..."
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
            filteredStudents
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{
            x: 1100,
          }}
        />
      </Card>
    </div>
  );
}