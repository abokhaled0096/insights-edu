"use client";

import { useState } from "react";
import { Card, Tag, Button, Input, Select, Empty, Modal, message } from "antd";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { scheduleMeetingAction, updateMeetingStatusAction } from "@/app/actions/advisor/actions";

const { TextArea } = Input;

type Meeting = { id: string; studentId: string; studentName: string | null; studentEmail: string; meetingDate: string; notes: string | null; status: string; createdAt: string };
type Student = { id: string; name: string | null };

type Props = { meetings: Meeting[]; students: Student[] };

export default function MeetingsClient({ meetings, students }: Props) {
  const [msgApi, contextHolder] = message.useMessage();
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "COMPLETED" | "CANCELLED">("ALL");
  const [modal, setModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetNotes, setMeetNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = meetings.filter((m) => filter === "ALL" || m.status === filter);

  const handleSchedule = async () => {
    if (!selectedStudent) { msgApi.warning("اختر الطالب"); return; }
    if (!meetDate) { msgApi.warning("حدد التاريخ"); return; }
    setLoading(true);
    const res = await scheduleMeetingAction({ studentId: selectedStudent, meetingDate: meetDate, notes: meetNotes || undefined });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setModal(false);
  };

  const handleStatus = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    const res = await updateMeetingStatusAction(id, status);
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
  };

  const statusLabel = (s: string) => s === "SCHEDULED" ? "مجدول" : s === "COMPLETED" ? "مكتمل" : "ملغي";
  const statusColor = (s: string) => s === "SCHEDULED" ? "blue" : s === "COMPLETED" ? "green" : "red";

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>الاجتماعات</h1>
          <p className="text-sm text-slate-500 mt-1">جدولة ومتابعة الاجتماعات مع الطلاب</p>
        </div>
        <Button type="primary" icon={<Calendar size={16} />} onClick={() => { setSelectedStudent(""); setMeetDate(""); setMeetNotes(""); setModal(true); }} style={{ borderRadius: 12 }} size="large">
          جدولة اجتماع جديد
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type={filter === "ALL" ? "primary" : "default"} onClick={() => setFilter("ALL")}>الكل ({meetings.length})</Button>
        <Button type={filter === "SCHEDULED" ? "primary" : "default"} onClick={() => setFilter("SCHEDULED")}>مجدولة ({meetings.filter((m) => m.status === "SCHEDULED").length})</Button>
        <Button type={filter === "COMPLETED" ? "primary" : "default"} onClick={() => setFilter("COMPLETED")} style={filter === "COMPLETED" ? { background: "#10b981", borderColor: "#10b981" } : {}}>مكتملة ({meetings.filter((m) => m.status === "COMPLETED").length})</Button>
        <Button type={filter === "CANCELLED" ? "primary" : "default"} danger={filter === "CANCELLED"} onClick={() => setFilter("CANCELLED")}>ملغاة ({meetings.filter((m) => m.status === "CANCELLED").length})</Button>
      </div>

      {filtered.length === 0 ? <Card className="rounded-2xl"><Empty description="لا توجد اجتماعات" /></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} className="rounded-2xl shadow-sm border-0" style={{ borderTop: `3px solid ${statusColor(m.status) === "blue" ? "#3b82f6" : statusColor(m.status) === "green" ? "#10b981" : "#ef4444"}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold" style={{ color: "#002060" }}>{m.studentName || "بدون اسم"}</span>
                <Tag color={statusColor(m.status)}>{statusLabel(m.status)}</Tag>
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-1 mb-1"><Clock size={14} /> {(() => { try { return format(new Date(m.meetingDate), "yyyy-MM-dd HH:mm"); } catch { return "-"; } })()}</div>
              {m.notes && <p className="text-sm text-slate-600 mt-2 p-2 rounded-lg" style={{ background: "#F8F9FC" }}>{m.notes}</p>}
              {m.status === "SCHEDULED" && (
                <div className="flex gap-2 mt-3">
                  <Button size="small" type="primary" icon={<CheckCircle size={12} />} style={{ background: "#10b981", borderColor: "#10b981" }} onClick={() => handleStatus(m.id, "COMPLETED")}>مكتمل</Button>
                  <Button size="small" danger icon={<XCircle size={12} />} onClick={() => handleStatus(m.id, "CANCELLED")}>إلغاء</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal title="جدولة اجتماع جديد" open={modal} onCancel={() => setModal(false)} onOk={handleSchedule} confirmLoading={loading} okText="جدولة" cancelText="إلغاء">
        <div className="space-y-4">
          <Select showSearch className="w-full" size="large" placeholder="اختر الطالب" value={selectedStudent || undefined} onChange={setSelectedStudent}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={students.map((s) => ({ label: s.name || "بدون اسم", value: s.id }))} />
          <Input type="datetime-local" size="large" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
          <TextArea rows={3} placeholder="ملاحظات (اختياري)" value={meetNotes} onChange={(e) => setMeetNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
