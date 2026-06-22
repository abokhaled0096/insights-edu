"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  Table,
  Input,
  Tag,
  Button,
  Avatar,
  Space,
  Dropdown,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  BookOpen,
  CalendarDays,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

type TeacherItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  coursesCount: number;
  courses: {
    id: string;
    name: string;
    code: string;
  }[];
};

type Props = {
  teachers: TeacherItem[];
};

export default function TeachersPage({
  teachers,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [deleteTeacher, setDeleteTeacher] =
    useState<TeacherItem | null>(
      null
    );

  const [msgApi, contextHolder] =
    message.useMessage();

  const filteredTeachers =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return teachers.filter(
        (teacher) =>
          teacher.name
            ?.toLowerCase()
            .includes(q) ||
          teacher.email
            .toLowerCase()
            .includes(q)
      );
    }, [search, teachers]);

  const totalCourses =
    teachers.reduce(
      (sum, teacher) =>
        sum +
        teacher.coursesCount,
      0
    );

  const columns: ColumnsType<TeacherItem> =
    [
      {
        title: "المدرس",
        key: "teacher",
        render: (_, teacher) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={
                teacher.image ||
                undefined
              }
              className="bg-indigo-500"
            >
              {teacher.name?.charAt(
                0
              ) || "T"}
            </Avatar>

            <div>
              <div className="font-semibold text-slate-800">
                {teacher.name ||
                  "بدون اسم"}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail size={12} />
                {teacher.email}
              </div>
            </div>
          </div>
        ),
      },

      {
        title: "الكورسات",
        key: "courses",
        render: (_, teacher) => (
          <div className="space-y-1">
            <Tag color="blue">
              {
                teacher.coursesCount
              }{" "}
              كورس
            </Tag>

            <div className="flex flex-wrap gap-1 max-w-62.5">
              {teacher.courses
                .slice(0, 2)
                .map((course) => (
                  <Tag
                    key={
                      course.id
                    }
                  >
                    {
                      course.name
                    }
                  </Tag>
                ))}

              {teacher.coursesCount >
                2 && (
                <Tag>
                  +
                  {teacher.coursesCount -
                    2}
                </Tag>
              )}
            </div>
          </div>
        ),
      },

      {
        title: "تاريخ الإنشاء",
        dataIndex:
          "createdAt",
        key: "createdAt",
        responsive: [
          "lg",
        ],
        render: (date) => (
          <span className="text-sm text-slate-500">
            {format(
              new Date(date),
              "yyyy-MM-dd"
            )}
          </span>
        ),
      },

      {
        title: "الإجراءات",
        key: "actions",
        width: 90,
        render: (_, teacher) => {
          const items: MenuProps["items"] =
            [
              {
                key: "view",
                icon: (
                  <Eye
                    size={16}
                  />
                ),
                label: (
                  <Link
                    href={`/admin/teachers/${teacher.id}`}
                  >
                    عرض
                  </Link>
                ),
              },
              {
                key: "edit",
                icon: (
                  <Pencil
                    size={16}
                  />
                ),
                label: (
                  <Link
                    href={`/admin/teachers/actions/?id=${teacher.id}`}
                  >
                    تعديل
                  </Link>
                ),
              },
              {
                key: "courses",
                icon: (
                  <BookOpen
                    size={16}
                  />
                ),
                label: (
                  <Link
                    href={`/admin/teachers/${teacher.id}/courses`}
                  >
                    إدارة المواد
                  </Link>
                ),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                danger: true,
                icon: (
                  <Trash2
                    size={16}
                  />
                ),
                label:
                  "حذف المدرس",
                onClick:
                  () =>
                    setDeleteTeacher(
                      teacher
                    ),
              },
            ];

          return (
            <Dropdown
              menu={{
                items,
              }}
              trigger={[
                "click",
              ]}
            >
              <Button
                icon={
                  <MoreHorizontal
                    size={16}
                  />
                }
              />
            </Dropdown>
          );
        },
      },
    ];

  const handleDelete =
    async () => {
      if (!deleteTeacher)
        return;

      msgApi.success(
        "تم حذف المدرس (اربط action لاحقاً)"
      );

      setDeleteTeacher(
        null
      );
    };

  return (
    <div className="space-y-6">
      {contextHolder}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            إدارة المدرسين
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            عرض جميع
            المدرسين
            والكورسات
            الخاصة بهم
          </p>
        </div>

        <Link href="/admin/teachers/new">
          <Button
            type="primary"
            size="large"
            icon={
              <UserPlus
                size={16}
              />
            }
          >
            إضافة مدرس
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي
            المدرسين
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              teachers.length
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            الكورسات
            المربوطة
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              totalCourses
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            متوسط
            الكورسات
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {teachers.length
              ? (
                  totalCourses /
                  teachers.length
                ).toFixed(
                  1
                )
              : "0"}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <Input
            size="large"
            placeholder="ابحث باسم المدرس أو البريد"
            prefix={
              <Search
                size={16}
              />
            }
            value={search}
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

          <div className="text-sm text-slate-500">
            النتائج:{" "}
            {
              filteredTeachers.length
            }
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredTeachers
          }
          pagination={{
            pageSize: 10,
            showSizeChanger:
              false,
          }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>

      <Modal
        open={
          !!deleteTeacher
        }
        onCancel={() =>
          setDeleteTeacher(
            null
          )
        }
        onOk={
          handleDelete
        }
        okText="حذف"
        cancelText="إلغاء"
        okButtonProps={{
          danger: true,
        }}
        title="حذف المدرس"
      >
        <p className="text-slate-600">
          هل أنت متأكد
          من حذف:{" "}
          <strong>
            {
              deleteTeacher?.name
            }
          </strong>
          ؟
        </p>
      </Modal>
    </div>
  );
}