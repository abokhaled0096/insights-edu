"use client";

import { Card, Table, Avatar, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Users, GraduationCap, ArrowLeft, BookOpen, ClipboardList } from "lucide-react";
import Link from "next/link";

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
};

export default function TeacherCourseDetailsClient({ course }: Props) {
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
      width: 120,
      render: (_, record) => (
        <Link href={`/teacher/students/${record.id}/insight`}>
          <Button type="link" size="small">
            تقرير الطالب
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher/courses">
            <Button type="default" icon={<ArrowLeft size={16} />} className="rounded-xl flex flex-row-reverse" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{course.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{course.code}</p>
          </div>
        </div>
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
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
}
