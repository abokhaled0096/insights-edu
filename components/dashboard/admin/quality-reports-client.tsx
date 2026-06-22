"use client";

import { Card, Table, Tag, Progress } from "antd";
import { BarChart2, Users, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";

type CoursePerf = { id: string; name: string; code: string; teacherNames: string; studentsCount: number; attendanceRate: number; avgScore: number; submissionRate: number };
type TeacherPerf = { id: string; name: string; email: string; courseCount: number; examCount: number; assignmentCount: number; activityCount: number };
type OverallStats = { avgAttendance: number; avgScore: number; atRiskStudents: number; totalStudents: number; totalCourses: number };

type Props = {
  data: {
    coursePerformance: CoursePerf[];
    teacherPerformance: TeacherPerf[];
    earlyInterventions: { id: string; name: string | null; email: string; aiReasons: string[]; aiRecommendations: string[]; predictedOutcome: string }[];
    overallStats: OverallStats;
  };
};

function rateColor(val: number, good = 75, mid = 50) {
  if (val >= good) return "#10b981";
  if (val >= mid) return "#f59e0b";
  return "#ef4444";
}

export default function QualityReportsClient({ data }: Props) {
  const { overallStats } = data;

  const statCards = [
    { title: "إجمالي الطلاب", value: overallStats.totalStudents, icon: <Users size={20} />, color: "#002060" },
    { title: "إجمالي الكورسات", value: overallStats.totalCourses, icon: <BookOpen size={20} />, color: "#F58220" },
    { title: "متوسط الحضور العام", value: `${overallStats.avgAttendance}%`, icon: <CheckCircle size={20} />, color: rateColor(overallStats.avgAttendance) },
    { title: "متوسط الدرجات العام", value: overallStats.avgScore, icon: <BarChart2 size={20} />, color: rateColor(overallStats.avgScore, 60, 40) },
    { title: "طلاب معرضين للخطر", value: overallStats.atRiskStudents, icon: <AlertTriangle size={20} />, color: overallStats.atRiskStudents > 0 ? "#ef4444" : "#10b981" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>تقارير الجودة</h1>
        <p className="text-sm text-slate-500 mt-1">مؤشرات أداء شاملة تساعد الإدارة في اتخاذ القرارات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="rounded-2xl shadow-sm border-0" style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-500">{card.title}</div>
                <div className="text-2xl font-bold mt-2" style={{ color: "#002060" }}>{card.value}</div>
              </div>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {data.earlyInterventions && data.earlyInterventions.length > 0 && (
        <Card 
          className="rounded-3xl shadow-lg border border-red-200 backdrop-blur-md" 
          style={{ background: "linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.8))", borderRight: "6px solid #ef4444" }}
          title={<span className="flex items-center gap-2 text-red-600 animate-pulse"><AlertTriangle size={20} /> حالات تستدعي التدخل العاجل (الذكاء الاصطناعي)</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.earlyInterventions.map((student) => (
              <div key={student.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-slate-800">{student.name || "بدون اسم"}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </div>
                  <Tag color="red">خطر حرج</Tag>
                </div>
                
                {student.aiReasons.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-700">الأسباب:</span>
                    <ul className="list-disc list-inside text-xs text-slate-600">
                      {student.aiReasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {student.aiRecommendations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {student.aiRecommendations.map((r, i) => <Tag color="orange" key={i} className="text-xs">{r}</Tag>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="rounded-2xl shadow-sm" title={<span className="flex items-center gap-2"><BarChart2 size={16} color="#F58220" /> أداء الكورسات</span>}>
        <Table
          rowKey="id"
          dataSource={data.coursePerformance}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          columns={[
            { title: "الكورس", key: "course", render: (_, r) => (<div><div className="font-semibold" style={{ color: "#002060" }}>{r.name}</div><div className="text-xs text-slate-500">{r.code}</div></div>) },
            { title: "المدرس", dataIndex: "teacherNames", ellipsis: true },
            { title: "الطلاب", dataIndex: "studentsCount", align: "center" as const, render: (v: number) => <Tag color="blue">{v}</Tag> },
            { title: "الحضور %", dataIndex: "attendanceRate", align: "center" as const, render: (v: number) => (<div style={{ minWidth: 80 }}><div className="text-xs font-bold mb-1" style={{ color: rateColor(v) }}>{v}%</div><Progress percent={v} showInfo={false} strokeColor={rateColor(v)} size="small" /></div>) },
            { title: "متوسط الدرجات", dataIndex: "avgScore", align: "center" as const, render: (v: number) => <span className="font-bold" style={{ color: rateColor(v, 60, 40) }}>{v}</span> },
            { title: "تسليم الواجبات %", dataIndex: "submissionRate", align: "center" as const, render: (v: number) => (<div style={{ minWidth: 80 }}><div className="text-xs font-bold mb-1" style={{ color: rateColor(v) }}>{v}%</div><Progress percent={v} showInfo={false} strokeColor={rateColor(v)} size="small" /></div>) },
          ]}
        />
      </Card>

      <Card className="rounded-2xl shadow-sm" title={<span className="flex items-center gap-2"><Users size={16} color="#002060" /> أداء المدرسين</span>}>
        <Table
          rowKey="id"
          dataSource={data.teacherPerformance}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "المدرس", key: "teacher", render: (_, r) => (<div><div className="font-semibold" style={{ color: "#002060" }}>{r.name}</div><div className="text-xs text-slate-500">{r.email}</div></div>) },
            { title: "الكورسات", dataIndex: "courseCount", align: "center" as const, render: (v: number) => <Tag color="blue">{v}</Tag> },
            { title: "الامتحانات", dataIndex: "examCount", align: "center" as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
            { title: "الواجبات", dataIndex: "assignmentCount", align: "center" as const, render: (v: number) => <Tag color="orange">{v}</Tag> },
            { title: "الأنشطة", dataIndex: "activityCount", align: "center" as const, render: (v: number) => <Tag color="green">{v}</Tag> },
          ]}
        />
      </Card>
    </div>
  );
}
