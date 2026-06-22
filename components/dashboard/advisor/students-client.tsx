"use client";

import { useState } from "react";
import { Card, Table, Tag, Input, Button, message, Modal, Switch } from "antd";
import { Search, MessageSquare, Calendar, Users, Eye } from "lucide-react";
import { saveRecommendationAction, scheduleMeetingAction } from "@/app/actions/advisor/actions";
import Link from "next/link";

const { TextArea } = Input;

type Student = { id: string; name: string | null; email: string; studentCode: string | null; coursesCount: number; attendanceRate: number; avgScore: number; assignmentRate: number; riskLevel: string | null };

type Props = { students: Student[] };

export default function AdvisorStudentsClient({ students }: Props) {
  const [search, setSearch] = useState("");
  const [msgApi, contextHolder] = message.useMessage();
  const [recModal, setRecModal] = useState(false);
  const [meetModal, setMeetModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [recText, setRecText] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [meetDate, setMeetDate] = useState("");
  const [meetNotes, setMeetNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.studentCode?.toLowerCase().includes(q);
  });

  const openRec = (id: string) => { setSelectedId(id); setRecText(""); setIsWarning(false); setRecModal(true); };
  const openMeet = (id: string) => { setSelectedId(id); setMeetDate(""); setMeetNotes(""); setMeetModal(true); };

  const handleSaveRec = async () => {
    if (!recText.trim()) { msgApi.warning("اكتب التوصية"); return; }
    setLoading(true);
    const res = await saveRecommendationAction({ studentId: selectedId, text: recText, isWarning });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setRecModal(false);
  };

  const handleScheduleMeet = async () => {
    if (!meetDate) { msgApi.warning("حدد التاريخ"); return; }
    setLoading(true);
    const res = await scheduleMeetingAction({ studentId: selectedId, meetingDate: meetDate, notes: meetNotes || undefined });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setMeetModal(false);
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>متابعة الطلاب</h1>
        <p className="text-sm text-slate-500 mt-1">قائمة بجميع الطلاب مع مؤشرات أدائهم</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 mb-5 justify-between">
          <div className="flex gap-3">
            <Input size="large" placeholder="ابحث بالاسم أو البريد أو الكود..." prefix={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
            <span className="text-sm text-slate-500 self-center">النتائج: {filtered.length}</span>
          </div>
          <Button size="large" type="primary" loading={loading} onClick={async () => {
            setLoading(true);
            const { analyzeAllStudentsAction } = await import("@/app/actions/student-insight-actions");
            const res = await analyzeAllStudentsAction();
            res.success ? msgApi.success(res.message) : msgApi.error(res.message);
            setLoading(false);
          }} style={{ background: "#ef4444", borderColor: "#ef4444", borderRadius: 12 }}>
            تشغيل تحليل الذكاء الاصطناعي للجميع
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={filtered}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 1000 }}
          columns={[
            { title: "الطالب", key: "student", render: (_, r) => (<div><div className="font-semibold" style={{ color: "#002060" }}>{r.name || "بدون اسم"}</div><div className="text-xs text-slate-500">{r.email}</div></div>) },
            { title: "الكود", dataIndex: "studentCode", render: (v: string | null) => v ? <Tag color="blue">{v}</Tag> : "-" },
            { title: "الكورسات", dataIndex: "coursesCount", align: "center" as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
            { title: "الحضور %", dataIndex: "attendanceRate", align: "center" as const, render: (v: number) => <Tag color={v >= 75 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
            { title: "الدرجات", dataIndex: "avgScore", align: "center" as const, render: (v: number) => <span className="font-bold" style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}>{v}</span> },
            { title: "التسليم %", dataIndex: "assignmentRate", align: "center" as const, render: (v: number) => <Tag color={v >= 75 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
            { title: "الخطورة", dataIndex: "riskLevel", align: "center" as const, render: (v: string | null) => v ? <Tag color={v === "HIGH" ? "red" : v === "MEDIUM" ? "orange" : "green"}>{v === "HIGH" ? "عالية" : v === "MEDIUM" ? "متوسطة" : "منخفضة"}</Tag> : <Tag>-</Tag> },
            { title: "إجراءات", key: "actions", render: (_: any, r: Student) => (
              <div className="flex gap-1">
                <Link href={`/advisor/students/${r.id}`}><Button size="small" type="primary" style={{ background: "#002060" }} icon={<Eye size={12} />} /></Link>
                <Button size="small" style={{ borderColor: "#F58220", color: "#F58220" }} icon={<MessageSquare size={12} />} onClick={() => openRec(r.id)} />
                <Button size="small" style={{ borderColor: "#002060", color: "#002060" }} icon={<Calendar size={12} />} onClick={() => openMeet(r.id)} />
              </div>
            )},
          ]}
        />
      </Card>

      <Modal title="إضافة توصية" open={recModal} onCancel={() => setRecModal(false)} onOk={handleSaveRec} confirmLoading={loading} okText="حفظ" cancelText="إلغاء">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><span>تحذير أكاديمي؟</span><Switch checked={isWarning} onChange={setIsWarning} /></div>
          <TextArea rows={4} placeholder="اكتب التوصية هنا..." value={recText} onChange={(e) => setRecText(e.target.value)} />
        </div>
      </Modal>

      <Modal title="جدولة اجتماع" open={meetModal} onCancel={() => setMeetModal(false)} onOk={handleScheduleMeet} confirmLoading={loading} okText="جدولة" cancelText="إلغاء">
        <div className="space-y-4">
          <Input type="datetime-local" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
          <TextArea rows={3} placeholder="ملاحظات (اختياري)" value={meetNotes} onChange={(e) => setMeetNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
