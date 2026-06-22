"use client";

import { useState } from "react";
import { Card, Table, Button, Tag, Modal, message, Avatar, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Users, GraduationCap, Plus, Trash2, ArrowLeft, BookOpen, ClipboardList } from "lucide-react";
import Link from "next/link";
import { enrollStudentsAction } from "@/app/actions/admin/enroll-students";
import { removeStudentCourseAction } from "@/app/actions/admin/remove-student-course";
import { useRouter } from "next/navigation";

type StudentInfo = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  studentCode: string | null;
};

type TeacherInfo = {
  id: string;
  name: string;
  email: string;
};

type CourseData = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  studentsCount: number;
  teachersCount: number;
  examsCount: number;
  assignmentsCount: number;
  activitiesCount: number;
  students: StudentInfo[];
  teachers: TeacherInfo[];
};

type Props = {
  course: CourseData;
  allStudents: any[];
};

export default function CourseDetailsClient({ course, allStudents }: Props) {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // Filter out students who are already enrolled
  const enrolledIds = new Set(course.students.map((s) => s.id));
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s.id));

  const handleEnroll = async () => {
    if (selectedStudentIds.length === 0) {
      messageApi.warning("يرجى اختيار طالب واحد على الأقل");
      return;
    }

    setLoading(true);
    const result = await enrollStudentsAction(course.id, selectedStudentIds);
    setLoading(false);

    if (result.error) {
      messageApi.error(result.error);
    } else {
      messageApi.success("تم إضافة الطلاب بنجاح!");
      setIsEnrollModalOpen(false);
      setSelectedStudentIds([]);
      router.refresh();
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من إزالة هذا الطالب من الكورس؟",
      okText: "حذف",
      cancelText: "إلغاء",
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await removeStudentCourseAction(course.id, studentId);
        if (result.error) {
          messageApi.error(result.error);
        } else {
          messageApi.success("تم إزالة الطالب من الكورس");
          router.refresh();
        }
      },
    });
  };

  const studentColumns: ColumnsType<StudentInfo> = [
    {
      title: "الطالب",
      key: "student",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.image}>{record.name.charAt(0)}</Avatar>
          <div>
            <div className="font-semibold text-slate-800">{record.name}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "كود الطالب",
      dataIndex: "studentCode",
      key: "studentCode",
      render: (code) => (code ? <Tag color="blue">{code}</Tag> : "-"),
    },
    {
      title: "إجراءات",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={16} />}
          onClick={() => handleRemoveStudent(record.id)}
        />
      ),
    },
  ];

  const modalColumns: ColumnsType<any> = [
    {
      title: "اسم الطالب",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "كود الطالب",
      dataIndex: "studentCode",
      key: "studentCode",
      render: (code) => code || "-",
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button type="default" icon={<ArrowLeft size={16} />} className="rounded-xl flex flex-row-reverse" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{course.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{course.code}</p>
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus size={16} />}
          onClick={() => setIsEnrollModalOpen(true)}
        >
          إضافة طلاب للكورس
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> الطلاب
          </div>
          <div className="text-2xl font-bold text-slate-800">{course.studentsCount}</div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
            <GraduationCap size={16} className="text-purple-500" /> المدرسين
          </div>
          <div className="text-2xl font-bold text-slate-800">{course.teachersCount}</div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-green-500" /> الامتحانات
          </div>
          <div className="text-2xl font-bold text-slate-800">{course.examsCount}</div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
            <BookOpen size={16} className="text-orange-500" /> الواجبات
          </div>
          <div className="text-2xl font-bold text-slate-800">{course.assignmentsCount}</div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="rounded-2xl shadow-sm" title="الطلاب المسجلين بالكورس">
        <Table
          rowKey="id"
          columns={studentColumns}
          dataSource={course.students}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Enroll Modal */}
      <Modal
        title="إضافة طلاب للكورس"
        open={isEnrollModalOpen}
        onCancel={() => {
          setIsEnrollModalOpen(false);
          setSelectedStudentIds([]);
        }}
        onOk={handleEnroll}
        confirmLoading={loading}
        okText="إضافة الطلاب المحددين"
        cancelText="إلغاء"
        width={700}
      >
        <div className="mb-4 text-slate-500">
          اختر الطلاب الذين ترغب في إضافتهم لكورس ({course.name}):
        </div>
        <Table
          rowSelection={{
            selectedRowKeys: selectedStudentIds,
            onChange: (selectedRowKeys) => {
              setSelectedStudentIds(selectedRowKeys as string[]);
            },
          }}
          rowKey="id"
          columns={modalColumns}
          dataSource={availableStudents}
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </Modal>
    </div>
  );
}
