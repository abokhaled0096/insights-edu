"use client";

import { Card, Table, Tag } from "antd";
import { Users, BarChart2, AlertTriangle, CheckCircle, FileText } from "lucide-react";

type StudentReport = { id: string; name: string | null; email: string; studentCode: string | null; attendanceRate: number; avgScore: number; riskLevel: string | null; warningsCount: number };
type Stats = { total: number; avgAttendance: number; avgScore: number; atRisk: number; warnings: number };

type Props = { data: { students: StudentReport[]; stats: Stats } };

export default function AdvisorReportsClient({ data }: Props) {
  const { stats } = data;

  const statCards = [
    { title: "إجمالي الطلاب", value: stats.total, icon: <Users size={20} />, color: "#002060" },
    { title: "متوسط الحضور", value: `${stats.avgAttendance}%`, icon: <CheckCircle size={20} />, color: stats.avgAttendance >= 75 ? "#10b981" : "#ef4444" },
    { title: "متوسط الدرجات", value: stats.avgScore, icon: <BarChart2 size={20} />, color: stats.avgScore >= 50 ? "#002060" : "#ef4444" },
    { title: "طلاب معرضين للخطر", value: stats.atRisk, icon: <AlertTriangle size={20} />, color: stats.atRisk > 0 ? "#ef4444" : "#10b981" },
    { title: "إجمالي التحذيرات", value: stats.warnings, icon: <FileText size={20} />, color: "#F58220" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>تقرير المرشد الأكاديمي</h1>
          <p className="text-sm text-slate-500 mt-1">تقرير شامل عن أداء الطلاب المتابعين</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#002060" }}>
          طباعة التقرير
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="rounded-2xl shadow-sm border-0" style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="flex justify-between items-center">
              <div><div className="text-sm text-slate-500">{card.title}</div><div className="text-2xl font-bold mt-2" style={{ color: "#002060" }}>{card.value}</div></div>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm" title="تقرير مفصل لكل طالب">
        <Table
          rowKey="id"
          dataSource={data.students}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 900 }}
          columns={[
            { title: "الطالب", key: "student", render: (_, r) => (<div><div className="font-semibold" style={{ color: "#002060" }}>{r.name || "بدون اسم"}</div><div className="text-xs text-slate-500">{r.email}</div></div>) },
            { title: "الكود", dataIndex: "studentCode", render: (v: string | null) => v ? <Tag color="blue">{v}</Tag> : "-" },
            { title: "الحضور %", dataIndex: "attendanceRate", align: "center" as const, sorter: (a: StudentReport, b: StudentReport) => a.attendanceRate - b.attendanceRate, render: (v: number) => <Tag color={v >= 75 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
            { title: "متوسط الدرجات", dataIndex: "avgScore", align: "center" as const, sorter: (a: StudentReport, b: StudentReport) => a.avgScore - b.avgScore, render: (v: number) => <span className="font-bold" style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}>{v}</span> },
            { title: "الخطورة", dataIndex: "riskLevel", align: "center" as const, render: (v: string | null) => v ? <Tag color={v === "HIGH" ? "red" : v === "MEDIUM" ? "orange" : "green"}>{v === "HIGH" ? "عالية" : v === "MEDIUM" ? "متوسطة" : "منخفضة"}</Tag> : <Tag>-</Tag> },
            { title: "التحذيرات", dataIndex: "warningsCount", align: "center" as const, render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <Tag>0</Tag> },
          ]}
        />
      </Card>
    </div>
  );
}
