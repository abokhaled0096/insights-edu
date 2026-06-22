"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  Table,
  Input,
  Button,
  Tag,
  Space,
  Dropdown,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Users,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";

type CourseItem = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  studentsCount: number;
  teachersCount: number;
};

type Props = {
  courses: CourseItem[];
};

export default function CoursesPage({
  courses,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] =
    useState<CourseItem | null>(null);

  const [msgApi, contextHolder] =
    message.useMessage();

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();

    return courses.filter((course) => {
      return (
        course.name
          .toLowerCase()
          .includes(q) ||
        course.code
          .toLowerCase()
          .includes(q)
      );
    });
  }, [search, courses]);

  const totalStudents = courses.reduce(
    (sum, course) =>
      sum + course.studentsCount,
    0
  );

  const totalTeachers = courses.reduce(
    (sum, course) =>
      sum + course.teachersCount,
    0
  );

  const columns: ColumnsType<CourseItem> =
    [
      {
        title: "الكورس",
        key: "course",
        render: (_, course) => (
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
        dataIndex: "studentsCount",
        key: "studentsCount",
        align: "center",
        render: (count) => (
          <Tag color="blue">
            {count} طالب
          </Tag>
        ),
      },

      {
        title: "المدرسين",
        dataIndex: "teachersCount",
        key: "teachersCount",
        align: "center",
        render: (count) => (
          <Tag color="purple">
            {count} مدرس
          </Tag>
        ),
      },

      {
        title: "تاريخ الإنشاء",
        dataIndex: "createdAt",
        key: "createdAt",
        responsive: ["lg"],
        render: (date) => (
          <span className="text-slate-500 text-sm">
            {format(
              new Date(date),
              "yyyy-MM-dd"
            )}
          </span>
        ),
      },

      {
        title: "",
        key: "actions",
        width: 70,
        render: (_, course) => (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "view",
                  label: (
                    <Link
                      href={`/admin/courses/${course.id}`}
                    >
                      عرض
                    </Link>
                  ),
                  icon: (
                    <Eye size={15} />
                  ),
                },

                {
                  key: "edit",
                  label: (
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                    >
                      تعديل
                    </Link>
                  ),
                  icon: (
                    <Pencil
                      size={15}
                    />
                  ),
                },

                {
                  type: "divider",
                },

                {
                  key: "delete",
                  danger: true,
                  label: "حذف",
                  icon: (
                    <Trash2
                      size={15}
                    />
                  ),
                  onClick: () =>
                    setSelectedCourse(
                      course
                    ),
                },
              ],
            }}
          >
            <Button
              type="text"
              icon={
                <MoreHorizontal
                  size={18}
                />
              }
            />
          </Dropdown>
        ),
      },
    ];

  const handleDelete = async () => {
    msgApi.success(
      "تم حذف الكورس (اربط action لاحقاً)"
    );

    setSelectedCourse(null);
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            إدارة الكورسات
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            عرض وإدارة جميع
            الكورسات داخل
            النظام
          </p>
        </div>

        <Link href="/admin/courses/new">
          <Button
            type="primary"
            size="large"
            icon={<Plus size={16} />}
          >
            إضافة كورس
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي الكورسات
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {courses.length}
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي الطلاب
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Users size={18} />
            {totalStudents}
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي المدرسين
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <GraduationCap
              size={18}
            />
            {totalTeachers}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <Input
            size="large"
            placeholder="ابحث باسم الكورس أو الكود..."
            prefix={
              <Search
                size={16}
              />
            }
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="max-w-md"
          />

          <div className="text-sm text-slate-500">
            النتائج:
            {" "}
            {
              filteredCourses.length
            }
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredCourses
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        open={!!selectedCourse}
        onCancel={() =>
          setSelectedCourse(
            null
          )
        }
        onOk={handleDelete}
        okText="حذف"
        cancelText="إلغاء"
        okButtonProps={{
          danger: true,
        }}
        title="حذف الكورس"
      >
        <p className="text-slate-600">
          هل أنت متأكد من حذف:
          {" "}
          <strong>
            {
              selectedCourse?.name
            }
          </strong>
          ؟
        </p>
      </Modal>
    </div>
  );
}