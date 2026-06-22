"use client";

import { useState } from "react";
import { Card, Tag, Button, Input, Switch, Modal, Empty, Select, message } from "antd";
import { MessageSquare, AlertTriangle, Filter } from "lucide-react";
import { format } from "date-fns";
import { saveRecommendationAction } from "@/app/actions/advisor/actions";

const { TextArea } = Input;

type Recommendation = { id: string; studentId: string; studentName: string | null; studentEmail: string; text: string; isWarning: boolean; createdAt: string };
type Student = { id: string; name: string | null };

type Props = { recommendations: Recommendation[]; students: Student[] };

export default function RecommendationsClient({ recommendations, students }: Props) {
  const [msgApi, contextHolder] = message.useMessage();
  const [filter, setFilter] = useState<"ALL" | "WARNING" | "REC">("ALL");
  const [modal, setModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [recText, setRecText] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = recommendations.filter((r) => {
    if (filter === "WARNING") return r.isWarning;
    if (filter === "REC") return !r.isWarning;
    return true;
  });

  const handleSave = async () => {
    if (!selectedStudent) { msgApi.warning("اختر الطالب"); return; }
    if (!recText.trim()) { msgApi.warning("اكتب التوصية"); return; }
    setLoading(true);
    const res = await saveRecommendationAction({ studentId: selectedStudent, text: recText, isWarning });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setModal(false);
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>التوصيات والإنذارات</h1>
          <p className="text-sm text-slate-500 mt-1">جميع التوصيات والتحذيرات الأكاديمية</p>
        </div>
        <Button type="primary" icon={<MessageSquare size={16} />} onClick={() => { setRecText(""); setIsWarning(false); setSelectedStudent(""); setModal(true); }} style={{ background: "#F58220", borderColor: "#F58220", borderRadius: 12 }} size="large">
          إضافة توصية جديدة
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type={filter === "ALL" ? "primary" : "default"} onClick={() => setFilter("ALL")}>الكل ({recommendations.length})</Button>
        <Button type={filter === "WARNING" ? "primary" : "default"} danger={filter === "WARNING"} onClick={() => setFilter("WARNING")}>تحذيرات ({recommendations.filter((r) => r.isWarning).length})</Button>
        <Button type={filter === "REC" ? "primary" : "default"} onClick={() => setFilter("REC")} style={filter === "REC" ? { background: "#10b981", borderColor: "#10b981" } : {}}>توصيات ({recommendations.filter((r) => !r.isWarning).length})</Button>
      </div>

      {filtered.length === 0 ? <Card className="rounded-2xl"><Empty description="لا توجد نتائج" /></Card> : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="rounded-2xl shadow-sm border-0" style={{ borderRight: `4px solid ${r.isWarning ? "#ef4444" : "#10b981"}` }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold" style={{ color: "#002060" }}>{r.studentName || "بدون اسم"}</span>
                  <span className="text-xs text-slate-400 mr-2">{r.studentEmail}</span>
                </div>
                {r.isWarning ? <Tag color="red" icon={<AlertTriangle size={12} />}>تحذير أكاديمي</Tag> : <Tag color="green">توصية</Tag>}
              </div>
              <p className="text-sm text-slate-700">{r.text}</p>
              <div className="text-xs text-slate-400 mt-2">{(() => { try { return format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"); } catch { return "-"; } })()}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal title="إضافة توصية جديدة" open={modal} onCancel={() => setModal(false)} onOk={handleSave} confirmLoading={loading} okText="حفظ" cancelText="إلغاء">
        <div className="space-y-4">
          <Select showSearch className="w-full" size="large" placeholder="اختر الطالب" value={selectedStudent || undefined} onChange={setSelectedStudent}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={students.map((s) => ({ label: s.name || "بدون اسم", value: s.id }))} />
          <div className="flex items-center gap-3"><span>تحذير أكاديمي؟</span><Switch checked={isWarning} onChange={setIsWarning} /></div>
          <TextArea rows={4} placeholder="اكتب التوصية هنا..." value={recText} onChange={(e) => setRecText(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
