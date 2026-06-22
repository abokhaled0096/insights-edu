"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Input, Select, DatePicker, message, Modal, Statistic, Empty, Switch, Progress } from "antd";
import { Users, AlertTriangle, Calendar, Clock, MessageSquare, Shield, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { saveRecommendationAction, scheduleMeetingAction, updateMeetingStatusAction } from "@/app/actions/advisor/actions";

const { TextArea } = Input;

type Student = { id: string; name: string | null; email: string; studentCode: string | null; attendanceRate: number; avgScore: number; assignmentRate: number };
type Recommendation = { id: string; studentName: string | null; text: string; isWarning: boolean; createdAt: string };
type Meeting = { id: string; studentName: string | null; studentId: string; meetingDate: string; notes: string | null; status: string; createdAt: string };
type Stats = { students: number; warnings: number; meetings: number; pendingMeetings: number };
type CourseStat = { id: string; name: string; code: string; studentsCount: number; attendanceRate: number; avgScore: number; submissionRate: number };

type Props = {
  data: { students: Student[]; recommendations: Recommendation[]; meetings: Meeting[]; stats: Stats; courseStats?: CourseStat[] };
};

export default function AdvisorDashboardClient({ data }: Props) {
  const [msgApi, contextHolder] = message.useMessage();
  const [recModal, setRecModal] = useState(false);
  const [meetModal, setMeetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [recText, setRecText] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [meetDate, setMeetDate] = useState<string>("");
  const [meetNotes, setMeetNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const statCards = [
    { title: "إجمالي الطلاب", value: data.stats.students, icon: <Users size={18} />, color: "#002060" },
    { title: "التحذيرات", value: data.stats.warnings, icon: <AlertTriangle size={18} />, color: "#F58220" },
    { title: "الاجتماعات", value: data.stats.meetings, icon: <Calendar size={18} />, color: "#002060" },
    { title: "اجتماعات معلقة", value: data.stats.pendingMeetings, icon: <Clock size={18} />, color: "#F58220" },
  ];

  const openRecModal = (studentId: string) => { setSelectedStudent(studentId); setRecText(""); setIsWarning(false); setRecModal(true); };
  const openMeetModal = (studentId: string) => { setSelectedStudent(studentId); setMeetDate(""); setMeetNotes(""); setMeetModal(true); };

  const handleSaveRec = async () => {
    if (!recText.trim()) { msgApi.warning("اكتب التوصية"); return; }
    setLoading(true);
    const res = await saveRecommendationAction({ studentId: selectedStudent, text: recText, isWarning });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setRecModal(false);
  };

  const handleScheduleMeet = async () => {
    if (!meetDate) { msgApi.warning("حدد التاريخ"); return; }
    setLoading(true);
    const res = await scheduleMeetingAction({ studentId: selectedStudent, meetingDate: meetDate, notes: meetNotes || undefined });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setMeetModal(false);
  };

  const handleMeetingStatus = async (meetingId: string, status: "COMPLETED" | "CANCELLED") => {
    const res = await updateMeetingStatusAction(meetingId, status);
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>لوحة المرشد الأكاديمي</h1>
        <p className="text-sm text-slate-500 mt-1">متابعة الطلاب والتوصيات والاجتماعات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Course Performance Stats */}
      {data.courseStats && data.courseStats.length > 0 && (
        <Card
          title={<span className="flex items-center gap-2"><BarChart2 size={16} color="#F58220" /> أداء الكورسات المتابَعة</span>}
          className="rounded-2xl shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.courseStats.map((cs) => (
              <div key={cs.id} className="p-4 rounded-xl space-y-3" style={{ background: "#F8F9FC", border: "1px solid #E5E7EB" }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: "#002060" }}>{cs.name}</span>
                  <Tag color="orange">{cs.code}</Tag>
                </div>
                <div className="text-xs text-slate-500">{cs.studentsCount} طالب مسجل</div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">الحضور</span>
                    <span style={{ color: cs.attendanceRate >= 75 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{cs.attendanceRate}%</span>
                  </div>
                  <Progress percent={cs.attendanceRate} showInfo={false}
                    strokeColor={cs.attendanceRate >= 75 ? "#10b981" : cs.attendanceRate >= 50 ? "#f59e0b" : "#ef4444"}
                    railColor="#E5E7EB" size="small" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">متوسط الدرجات</span>
                    <span style={{ color: cs.avgScore >= 60 ? "#002060" : "#ef4444", fontWeight: 700 }}>{cs.avgScore}/100</span>
                  </div>
                  <Progress percent={cs.avgScore} showInfo={false}
                    strokeColor={cs.avgScore >= 60 ? "#002060" : "#ef4444"}
                    railColor="#E5E7EB" size="small" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">تسليم الواجبات</span>
                    <span style={{ color: "#F58220", fontWeight: 700 }}>{cs.submissionRate}%</span>
                  </div>
                  <Progress percent={cs.submissionRate} showInfo={false}
                    strokeColor="#F58220"
                    railColor="#E5E7EB" size="small" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Students Table */}
      <Card title={<span className="flex items-center gap-2"><Shield size={16} color="#002060" /> قائمة الطلاب</span>} className="rounded-2xl shadow-sm">
        <Table rowKey="id" pagination={{ pageSize: 10 }} dataSource={data.students} columns={[
          { title: "الاسم", dataIndex: "name", render: (v: string | null) => v || "بدون اسم" },
          { title: "الكود", dataIndex: "studentCode", render: (v: string | null) => v || "-" },
          { title: "الحضور %", dataIndex: "attendanceRate", render: (v: number) => <Tag color={v >= 75 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
          { title: "متوسط الدرجات", dataIndex: "avgScore", render: (v: number) => <span style={{ color: v >= 50 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{v}</span> },
          { title: "التسليمات %", dataIndex: "assignmentRate", render: (v: number) => <Tag color={v >= 75 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
          { title: "إجراءات", key: "actions", render: (_: any, record: Student) => (
            <div className="flex gap-2">
              <Button size="small" type="primary" style={{ background: "#F58220", borderColor: "#F58220" }} onClick={() => openRecModal(record.id)}><MessageSquare size={12} /> توصية</Button>
              <Button size="small" style={{ borderColor: "#002060", color: "#002060" }} onClick={() => openMeetModal(record.id)}><Calendar size={12} /> اجتماع</Button>
            </div>
          )},
        ]} />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recommendations */}
        <Card title="التوصيات الأخيرة" className="rounded-2xl shadow-sm">
          {data.recommendations.length === 0 ? <Empty description="لا توجد توصيات" /> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.recommendations.map((r) => (
                <div key={r.id} className="p-3 rounded-xl" style={{ background: r.isWarning ? "#FEF2F2" : "#F0FDF4", borderRight: `3px solid ${r.isWarning ? "#ef4444" : "#10b981"}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: "#002060" }}>{r.studentName}</span>
                    {r.isWarning ? <Tag color="red">تحذير</Tag> : <Tag color="green">توصية</Tag>}
                  </div>
                  <div className="text-sm text-slate-600">{r.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{format(new Date(r.createdAt), "yyyy-MM-dd HH:mm")}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Meetings */}
        <Card title="الاجتماعات" className="rounded-2xl shadow-sm">
          {data.meetings.length === 0 ? <Empty description="لا توجد اجتماعات" /> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.meetings.map((m) => (
                <div key={m.id} className="p-3 rounded-xl" style={{ background: "#F8F9FC" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: "#002060" }}>{m.studentName}</span>
                    <Tag color={m.status === "SCHEDULED" ? "blue" : m.status === "COMPLETED" ? "green" : "red"}>{m.status === "SCHEDULED" ? "مجدول" : m.status === "COMPLETED" ? "مكتمل" : "ملغي"}</Tag>
                  </div>
                  <div className="text-sm text-slate-500">{format(new Date(m.meetingDate), "yyyy-MM-dd HH:mm")}</div>
                  {m.notes && <div className="text-xs text-slate-400 mt-1">{m.notes}</div>}
                  {m.status === "SCHEDULED" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="small" type="primary" style={{ background: "#10b981", borderColor: "#10b981" }} onClick={() => handleMeetingStatus(m.id, "COMPLETED")}>مكتمل</Button>
                      <Button size="small" danger onClick={() => handleMeetingStatus(m.id, "CANCELLED")}>إلغاء</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recommendation Modal */}
      <Modal title="إضافة توصية" open={recModal} onCancel={() => setRecModal(false)} onOk={handleSaveRec} confirmLoading={loading} okText="حفظ" cancelText="إلغاء">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span>تحذير أكاديمي؟</span>
            <Switch checked={isWarning} onChange={setIsWarning} />
          </div>
          <TextArea rows={4} placeholder="اكتب التوصية هنا..." value={recText} onChange={(e) => setRecText(e.target.value)} />
        </div>
      </Modal>

      {/* Meeting Modal */}
      <Modal title="جدولة اجتماع" open={meetModal} onCancel={() => setMeetModal(false)} onOk={handleScheduleMeet} confirmLoading={loading} okText="جدولة" cancelText="إلغاء">
        <div className="space-y-4">
          <Input type="datetime-local" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
          <TextArea rows={3} placeholder="ملاحظات (اختياري)" value={meetNotes} onChange={(e) => setMeetNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
