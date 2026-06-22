"use client";

import { Card, Table, Tag, Empty, Tabs, Badge, Statistic, Row, Col } from "antd";
import { ClipboardList, Clock, Loader2, CheckCircle2 } from "lucide-react";

type QuizState = "upcoming" | "pending" | "graded";

type QuizItem = {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  score: number | null;
  state: QuizState;
};

type Props = {
  quizzes: QuizItem[];
};

export default function StudentQuizzesClient({ quizzes }: Props) {
  const upcoming = quizzes.filter((q) => q.state === "upcoming");
  const pending  = quizzes.filter((q) => q.state === "pending");
  const graded   = quizzes.filter((q) => q.state === "graded");

  const avgScore =
    graded.length === 0
      ? null
      : Math.round(graded.reduce((s, q) => s + (q.score ?? 0), 0) / graded.length);

  // ── shared column helpers ──────────────────────────────────────────────────
  const courseCol = {
    title: "المادة",
    key: "course",
    render: (_: unknown, r: QuizItem) => (
      <span>
        {r.courseName} <Tag color="blue">{r.courseCode}</Tag>
      </span>
    ),
  };

  const titleCol = {
    title: "الكويز",
    dataIndex: "title" as keyof QuizItem,
  };

  // ── Tabs items ─────────────────────────────────────────────────────────────
  const tabItems = [
    {
      key: "graded",
      label: (
        <span className="flex items-center gap-1">
          <CheckCircle2 size={14} className="text-green-500" />
          تم التصحيح
          <Badge count={graded.length} color="#10b981" />
        </span>
      ),
      children: (
        <Card variant="borderless">
          {graded.length === 0 ? (
            <Empty description="لا توجد كويزات مصححة بعد" />
          ) : (
            <Table
              rowKey="id"
              dataSource={graded}
              pagination={{ pageSize: 8 }}
              columns={[
                titleCol,
                courseCol,
                {
                  title: "الدرجة",
                  dataIndex: "score",
                  render: (v: number | null) =>
                    v === null ? (
                      <Tag>—</Tag>
                    ) : (
                      <span
                        className="font-bold text-base"
                        style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}
                      >
                        {v} / 100
                      </span>
                    ),
                  sorter: (a: QuizItem, b: QuizItem) =>
                    (a.score ?? 0) - (b.score ?? 0),
                },
                {
                  title: "الحالة",
                  dataIndex: "score",
                  render: (v: number | null) =>
                    v === null ? (
                      <Tag color="default">—</Tag>
                    ) : (
                      <Tag color={v >= 50 ? "green" : "red"}>
                        {v >= 50 ? "ناجح ✓" : "راسب ✗"}
                      </Tag>
                    ),
                },
              ]}
            />
          )}
        </Card>
      ),
    },
    {
      key: "pending",
      label: (
        <span className="flex items-center gap-1">
          <Loader2 size={14} className="text-amber-500 animate-spin" />
          بانتظار تصحيح الدكتور
          <Badge count={pending.length} color="#f59e0b" />
        </span>
      ),
      children: (
        <Card variant="borderless">
          {pending.length === 0 ? (
            <Empty description="لا توجد كويزات في انتظار التصحيح" />
          ) : (
            <Table
              rowKey="id"
              dataSource={pending}
              pagination={false}
              columns={[
                titleCol,
                courseCol,
                {
                  title: "الحالة",
                  key: "status",
                  render: () => (
                    <Tag
                      color="orange"
                      icon={<Loader2 size={11} className="animate-spin inline ml-1" />}
                    >
                      في انتظار تصحيح الدكتور
                    </Tag>
                  ),
                },
              ]}
            />
          )}
        </Card>
      ),
    },
    {
      key: "upcoming",
      label: (
        <span className="flex items-center gap-1">
          <Clock size={14} className="text-blue-500" />
          كويزات قادمة
          <Badge count={upcoming.length} color="#6366f1" />
        </span>
      ),
      children: (
        <Card variant="borderless">
          {upcoming.length === 0 ? (
            <Empty description="لا توجد كويزات قادمة" />
          ) : (
            <Table
              rowKey="id"
              dataSource={upcoming}
              pagination={false}
              columns={[
                titleCol,
                courseCol,
                {
                  title: "الحالة",
                  key: "status",
                  render: () => (
                    <Tag color="blue" icon={<Clock size={11} className="inline ml-1" />}>
                      قادم قريباً
                    </Tag>
                  ),
                },
              ]}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
          كويزاتي
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          جميع كويزاتك مصنّفة حسب حالتها
        </p>
      </div>

      {/* Summary stats */}
      <Card className="rounded-2xl shadow-sm" style={{ borderTop: "3px solid #6366f1" }}>
        <Row gutter={[24, 16]}>
          <Col xs={12} md={6}>
            <Statistic
              title="إجمالي الكويزات"
              value={quizzes.length}
              styles={{ content: { color: "#002060", fontWeight: 700 } }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="تم التصحيح"
              value={graded.length}
              styles={{ content: { color: "#10b981", fontWeight: 700 } }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="بانتظار التصحيح"
              value={pending.length}
              styles={{ content: { color: "#f59e0b", fontWeight: 700 } }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="متوسط الدرجات"
              value={avgScore === null ? "لا يوجد" : `${avgScore}%`}
              styles={{ content: {
                color:
                  avgScore === null
                    ? "#94a3b8"
                    : avgScore >= 70
                    ? "#10b981"
                    : avgScore >= 50
                    ? "#f59e0b"
                    : "#ef4444",
                fontWeight: 700,
              } }}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabbed view */}
      <Card className="rounded-2xl shadow-sm">
        <Tabs
          defaultActiveKey="graded"
          items={tabItems}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Card>
    </div>
  );
}

