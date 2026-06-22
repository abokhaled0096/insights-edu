"use client";

import {
  Card, Table, Tag, Empty, Tabs, Badge, Statistic, Row, Col, Progress,
} from "antd";
import { Clock, Loader2, CheckCircle2, BookOpen, Users } from "lucide-react";
import Link from "next/link";

type QuizState = "upcoming" | "pending" | "graded";

type QuizItem = {
  id: string;
  title: string;
  score: number | null;
  state: QuizState;
};

type AttendanceRecord = { status: string; date: string };

type Props = {
  course: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    teacherName: string;
  };
  quizzes: QuizItem[];
  attendanceRate: number;
  avgScore: number | null;
  recentAttendance: AttendanceRecord[];
};

export default function StudentCourseDetailClient({
  course,
  quizzes,
  attendanceRate,
  avgScore,
  recentAttendance,
}: Props) {
  const upcoming = quizzes.filter((q) => q.state === "upcoming");
  const pending  = quizzes.filter((q) => q.state === "pending");
  const graded   = quizzes.filter((q) => q.state === "graded");

  // Quiz tabs
  const quizTabItems = [
    {
      key: "graded",
      label: (
        <span className="flex items-center gap-1">
          <CheckCircle2 size={13} className="text-green-500" />
          تم التصحيح
          <Badge count={graded.length} color="#10b981" />
        </span>
      ),
      children:
        graded.length === 0 ? (
          <Empty description="لا توجد كويزات مصححة بعد" />
        ) : (
          <Table
            rowKey="id"
            dataSource={graded}
            pagination={false}
            size="small"
            columns={[
              { title: "الكويز", dataIndex: "title" },
              {
                title: "الدرجة",
                dataIndex: "score",
                render: (v: number | null) =>
                  v === null ? (
                    <Tag>—</Tag>
                  ) : (
                    <span
                      className="font-bold"
                      style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}
                    >
                      {v} / 100
                    </span>
                  ),
              },
              {
                title: "الحالة",
                dataIndex: "score",
                render: (v: number | null) =>
                  v === null ? null : (
                    <Tag color={v >= 50 ? "green" : "red"}>
                      {v >= 50 ? "ناجح ✓" : "راسب ✗"}
                    </Tag>
                  ),
              },
            ]}
          />
        ),
    },
    {
      key: "pending",
      label: (
        <span className="flex items-center gap-1">
          <Loader2 size={13} className="text-amber-500 animate-spin" />
          بانتظار التصحيح
          <Badge count={pending.length} color="#f59e0b" />
        </span>
      ),
      children:
        pending.length === 0 ? (
          <Empty description="لا توجد كويزات في انتظار التصحيح" />
        ) : (
          <Table
            rowKey="id"
            dataSource={pending}
            pagination={false}
            size="small"
            columns={[
              { title: "الكويز", dataIndex: "title" },
              {
                title: "الحالة",
                key: "status",
                render: () => (
                  <Tag color="orange">في انتظار تصحيح الدكتور</Tag>
                ),
              },
            ]}
          />
        ),
    },
    {
      key: "upcoming",
      label: (
        <span className="flex items-center gap-1">
          <Clock size={13} className="text-blue-500" />
          قادمة
          <Badge count={upcoming.length} color="#6366f1" />
        </span>
      ),
      children:
        upcoming.length === 0 ? (
          <Empty description="لا توجد كويزات قادمة" />
        ) : (
          <Table
            rowKey="id"
            dataSource={upcoming}
            pagination={false}
            size="small"
            columns={[
              { title: "الكويز", dataIndex: "title" },
              {
                title: "الحالة",
                key: "status",
                render: () => <Tag color="blue">قادم قريباً</Tag>,
              },
            ]}
          />
        ),
    },
  ];

  // Recent attendance tab
  const attendanceTabItem = {
    key: "attendance",
    label: (
      <span className="flex items-center gap-1">
        <Users size={13} className="text-indigo-500" />
        سجل الحضور
      </span>
    ),
    children:
      recentAttendance.length === 0 ? (
        <Empty description="لا توجد سجلات حضور" />
      ) : (
        <Table
          rowKey={(record) => record.date}
          dataSource={recentAttendance}
          pagination={false}
          size="small"
          columns={[
            {
              title: "التاريخ",
              dataIndex: "date",
              render: (v: string) => new Date(v).toLocaleDateString("ar-EG"),
            },
            {
              title: "الحالة",
              dataIndex: "status",
              render: (s: string) => (
                <Tag
                  color={
                    s === "PRESENT" ? "green" : s === "ABSENT" ? "red" : "orange"
                  }
                >
                  {s === "PRESENT" ? "حاضر" : s === "ABSENT" ? "غائب" : "مرفوض"}
                </Tag>
              ),
            },
          ]}
        />
      ),
  };

  const attColor =
    attendanceRate >= 75 ? "#10b981" : attendanceRate >= 50 ? "#f59e0b" : "#ef4444";
  const scoreColor =
    avgScore === null
      ? "#94a3b8"
      : avgScore >= 70
      ? "#10b981"
      : avgScore >= 50
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/student/courses" className="hover:text-indigo-500 transition-colors">
          كورساتي
        </Link>
        <span>›</span>
        <span style={{ color: "#002060" }}>{course.name}</span>
      </div>

      {/* Course header */}
      <Card
        className="rounded-2xl shadow-sm"
        style={{ borderTop: "3px solid #6366f1" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 48, height: 48, background: "#ede9fe" }}
            >
              <BookOpen size={22} color="#6366f1" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#002060" }}>
                {course.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Tag color="purple">{course.code}</Tag>
                <span className="text-xs text-slate-400">
                  د. {course.teacherName}
                </span>
              </div>
            </div>
          </div>
        </div>
        {course.description && (
          <p className="text-sm text-slate-500 mt-3">{course.description}</p>
        )}
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="إجمالي الكويزات"
              value={quizzes.length}
              styles={{ content: { color: "#002060", fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <p className="text-sm text-slate-500 mb-2">نسبة الحضور</p>
            <Progress
              type="circle"
              percent={attendanceRate}
              size={80}
              strokeColor={attColor}
              format={(p) => `${p}%`}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="متوسط درجات الكويزات"
              value={avgScore === null ? "—" : `${avgScore}%`}
              styles={{ content: { color: scoreColor, fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quizzes + Attendance tabs */}
      <Card className="rounded-2xl shadow-sm">
        <Tabs
          defaultActiveKey="graded"
          items={[...quizTabItems, attendanceTabItem]}
          tabBarStyle={{ marginBottom: 12 }}
        />
      </Card>
    </div>
  );
}
