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
  Modal,
  message,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import {
  Search,
  Eye,
  Users,
  Bell,
  Send,
} from "lucide-react";

import {
  sendNotificationToStudentAction,
  sendNotificationToAllStudentsAction,
} from "@/app/actions/teacher/notifications";

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
  const [search, setSearch] = useState("");
  const [notifStudent, setNotifStudent] = useState<StudentItem | null>(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [notifLoading, setNotifLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  const handleSendNotif = async () => {
    if (!notifStudent || !notifMsg.trim()) { msgApi.warning("اكتب الرسالة"); return; }
    setNotifLoading(true);
    const res = await sendNotificationToStudentAction({ receiverId: notifStudent.id, message: notifMsg });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setNotifLoading(false);
    setNotifStudent(null);
    setNotifMsg("");
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) { msgApi.warning("اكتب الرسالة"); return; }
    setNotifLoading(true);
    const res = await sendNotificationToAllStudentsAction({ message: broadcastMsg });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setNotifLoading(false);
    setBroadcastModal(false);
    setBroadcastMsg("");
  };

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
        title: "إجراءات",
        key: "actions",
        width: 140,
        render: (_, student) => (
          <div className="flex gap-1">
            <Link href={`/teacher/students/${student.id}/insight`}>
              <Button type="link" size="small" icon={<Eye size={13} />}>عرض</Button>
            </Link>
            <Button
              size="small"
              style={{ borderColor: "#F58220", color: "#F58220" }}
              icon={<Bell size={13} />}
              onClick={() => { setNotifStudent(student); setNotifMsg(""); }}
            />
          </div>
        ),
      },
    ];

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
            الطلاب
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            جميع الطلاب المرتبطين بكورساتك
          </p>
        </div>
        <Button
          type="primary"
          style={{ background: "#F58220", borderColor: "#F58220" }}
          icon={<Send size={15} />}
          onClick={() => setBroadcastModal(true)}
        >
          إشعار جماعي
        </Button>
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
            prefix={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredStudents}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Individual Notification Modal */}
      <Modal
        title={`إرسال إشعار — ${notifStudent?.name || ""}`}
        open={!!notifStudent}
        onCancel={() => setNotifStudent(null)}
        onOk={handleSendNotif}
        confirmLoading={notifLoading}
        okText="إرسال"
        cancelText="إلغاء"
        okButtonProps={{ style: { background: "#F58220", borderColor: "#F58220" } }}
      >
        <Input.TextArea
          rows={4}
          placeholder="اكتب الرسالة هنا..."
          value={notifMsg}
          onChange={(e) => setNotifMsg(e.target.value)}
          className="mt-2"
        />
      </Modal>

      {/* Broadcast Modal */}
      <Modal
        title="إشعار جماعي لجميع الطلاب"
        open={broadcastModal}
        onCancel={() => setBroadcastModal(false)}
        onOk={handleBroadcast}
        confirmLoading={notifLoading}
        okText="إرسال للجميع"
        cancelText="إلغاء"
        okButtonProps={{ style: { background: "#F58220", borderColor: "#F58220" } }}
      >
        <p className="text-sm text-slate-500 mb-3">
          سيتم إرسال هذا الإشعار لجميع الطلاب المسجلين في كورساتك.
        </p>
        <Input.TextArea
          rows={4}
          placeholder="اكتب الرسالة هنا..."
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
        />
      </Modal>
    </div>
  );
}