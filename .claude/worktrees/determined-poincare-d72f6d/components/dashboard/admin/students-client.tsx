"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  Table,
  Input,
  Button,
  Avatar,
  Tag,
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
  UserPlus,
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
};

type Props = {
  students: StudentItem[];
};

export default function StudentsPage({
  students,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [
    selectedStudent,
    setSelectedStudent,
  ] = useState<StudentItem | null>(
    null
  );

  const [msgApi, contextHolder] =
    message.useMessage();

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

  const totalCourses =
    students.reduce(
      (sum, student) =>
        sum +
        student.coursesCount,
      0
    );

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
        title: "الكود",
        dataIndex:
          "studentCode",
        key: "studentCode",
        render: (code) => (
          <Tag color="blue">
            {code ||
              "غير متوفر"}
          </Tag>
        ),
      },

      {
        title: "الكورسات",
        dataIndex:
          "coursesCount",
        key: "coursesCount",
        align: "center",
        render: (
          count
        ) => (
          <Tag color="purple">
            {count} كورس
          </Tag>
        ),
      },

      {
        title: "الحضور",
        dataIndex:
          "attendancesCount",
        key: "attendancesCount",
        align: "center",
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
          "تاريخ التسجيل",
        dataIndex:
          "createdAt",
        key:
          "createdAt",
        responsive: [
          "lg",
        ],
        render: (
          date
        ) => (
          <span className="text-sm text-slate-500">
            {format(
              new Date(
                date
              ),
              "yyyy-MM-dd"
            )}
          </span>
        ),
      },

      {
        title: "الإجراءات",
        key: "actions",
        width: 70,
        render: (
          _,
          student
        ) => (
         <Button
            type="text"            
          >
            <Link
              href={`/admin/students/actions/?id=${student.id}`}
              >
                <MoreHorizontal size={16} />

              </Link>
            </Button>
        ),
      },
    ];

  const handleDelete =
    async () => {
      msgApi.success(
        "تم حذف الطالب (اربط action لاحقاً)"
      );

      setSelectedStudent(
        null
      );
    };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            إدارة الطلاب
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            عرض وإدارة
            جميع الطلاب
          </p>
        </div>

        <Link href="/admin/students/new">
          <Button
            type="primary"
            size="large"
            icon={
              <UserPlus
                size={
                  16
                }
              />
            }
          >
            إضافة طالب
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي الطلاب
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              students.length
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            إجمالي التسجيلات
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              totalCourses
            }
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">
            سجلات الحضور
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-1">
            {
              totalAttendance
            }
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <Input
            size="large"
            placeholder="ابحث باسم الطالب أو الإيميل أو الكود"
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

          <div className="text-sm text-slate-500">
            النتائج:
            {" "}
            {
              filteredStudents.length
            }
          </div>
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
            x: 1000,
          }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        open={
          !!selectedStudent
        }
        onCancel={() =>
          setSelectedStudent(
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
        title="حذف الطالب"
      >
        <p className="text-slate-600">
          هل أنت متأكد من
          حذف:
          {" "}
          <strong>
            {
              selectedStudent?.name
            }
          </strong>
          ؟
        </p>
      </Modal>
    </div>
  );
}