"use client";

import { Card, Table, Tag, Badge, Empty } from "antd";
import { BookOpen, CheckCircle, FileText, ClipboardList, Bell, AlertTriangle, Award } from "lucide-react";
import { format } from "date-fns";

type Props = {
  data: {
    stats: { courses: number; attendance: number; exams: number; assignments: number };
    courses: { id: string; name: string; code: string }[];
    recentAttendance: { id: string; course: string; status: string; createdAt: string }[];
    exams: { id: string; title: string; course: string; dueDate: string }[];
    notifications: { id: string; message: string; isRead: boolean; senderName: string; senderRole: string; createdAt: string }[];
    recommendations: { id: string; text: string; isWarning: boolean; advisorName: string; createdAt: string }[];
    grades: { id: string; examTitle: string; courseName: string; courseCode: string; score: number; createdAt: string }[];
  };
};
export default function StudentDashboardPage({ data }: Props) {
  const cards = [
    { title: "كورساتي", value: data.stats.courses, icon: <BookOpen size={18} />, color: "#F58220" },
    { title: "الحضور", value: data.stats.attendance, icon: <CheckCircle size={18} />, color: "#002060" },
    { title: "الامتحانات", value: data.stats.exams, icon: <ClipboardList size={18} />, color: "#F58220" },
    { title: "التسليمات", value: data.stats.assignments, icon: <FileText size={18} />, color: "#002060" },
  ];
  const unreadCount = data.notifications.filter((n) => !n.isRead).length;
  const warningCount = data.recommendations.filter((r) => r.isWarning).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>لوحة الطالب</h1>
        <p className="text-sm text-slate-500 mt-1">نظرة سريعة على تقدمك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
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
      {warningCount > 0 && (
        <Card className="rounded-2xl shadow-sm border-0" style={{ background: "#FFF7ED", borderRight: "4px solid #F58220" }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} color="#F58220" />
            <span className="font-semibold" style={{ color: "#F58220" }}>لديك {warningCount} تحذير أكاديمي</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="كورساتي" className="rounded-2xl shadow-sm">
          {data.courses.length === 0 ? <Empty description="لا توجد كورسات" /> : (
            <div className="space-y-3">
              {data.courses.map((course) => (
                <div key={course.id} className="p-3 rounded-xl" style={{ background: "#F8F9FC" }}>
                  <div className="font-semibold" style={{ color: "#002060" }}>{course.name}</div>
                  <Tag color="orange" className="mt-1">{course.code}</Tag>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title={<span className="flex items-center gap-2"><Award size={16} color="#F58220" /> درجاتي</span>} className="rounded-2xl shadow-sm">
          {data.grades.length === 0 ? <Empty description="لا توجد درجات" /> : (
            <Table rowKey="id" pagination={false} size="small" dataSource={data.grades} columns={[
              { title: "الامتحان", dataIndex: "examTitle" },
              { title: "الكورس", dataIndex: "courseCode", render: (v: string) => <Tag color="blue">{v}</Tag> },
              { title: "الدرجة", dataIndex: "score", render: (v: number) => <span className="font-bold" style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}>{v}</span> },
            ]} />
          )}
        </Card>
      </div>
      <Card title="آخر الحضور" className="rounded-2xl shadow-sm">
        <Table rowKey="id" pagination={false} dataSource={data.recentAttendance} columns={[
          { title: "الكورس", dataIndex: "course" },
          { title: "الحالة", dataIndex: "status", render: (status: string) => <Tag color={status === "PRESENT" ? "green" : status === "ABSENT" ? "red" : "orange"}>{status}</Tag> },
          { title: "الوقت", dataIndex: "createdAt", render: (v: string) => format(new Date(v), "yyyy-MM-dd HH:mm") },
        ]} />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title={<span className="flex items-center gap-2"><Badge count={unreadCount} size="small"><Bell size={16} color="#002060" /></Badge> الإشعارات</span>} className="rounded-2xl shadow-sm">
          {data.notifications.length === 0 ? <Empty description="لا توجد إشعارات" /> : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl" style={{ background: n.isRead ? "#F8F9FC" : "#FFF7ED", borderRight: n.isRead ? "none" : "3px solid #F58220" }}>
                  <div className="text-sm" style={{ color: "#002060" }}>{n.message}</div>
                  <div className="text-xs text-slate-400 mt-1">{n.senderName} · {format(new Date(n.createdAt), "yyyy-MM-dd HH:mm")}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title={<span className="flex items-center gap-2"><AlertTriangle size={16} color="#F58220" /> توصيات المرشد</span>} className="rounded-2xl shadow-sm">
          {data.recommendations.length === 0 ? <Empty description="لا توجد توصيات" /> : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recommendations.map((r) => (
                <div key={r.id} className="p-3 rounded-xl" style={{ background: r.isWarning ? "#FEF2F2" : "#F0FDF4", borderRight: `3px solid ${r.isWarning ? "#ef4444" : "#10b981"}` }}>
                  <div className="flex items-center gap-2 mb-1">{r.isWarning ? <Tag color="red">تحذير</Tag> : <Tag color="green">توصية</Tag>}</div>
                  <div className="text-sm" style={{ color: "#002060" }}>{r.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{r.advisorName} · {format(new Date(r.createdAt), "yyyy-MM-dd")}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="المهام القادمة" className="rounded-2xl shadow-sm">
        <Table rowKey="id" pagination={false} dataSource={data.exams} columns={[
          { title: "العنوان", dataIndex: "title" },
          { title: "الكورس", dataIndex: "course" },
          { title: "الموعد", dataIndex: "dueDate", render: (v: string) => format(new Date(v), "yyyy-MM-dd") },
        ]} />
      </Card>
    </div>
  );
}
