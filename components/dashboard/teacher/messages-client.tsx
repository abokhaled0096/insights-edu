"use client";

import { useState } from "react";
import { Card, Select, Button, Input, Tag, Table, message, Space, Divider, Empty } from "antd";
import { Send, Users, UserCheck, MessageSquare } from "lucide-react";
import { sendNotificationToStudentAction, sendNotificationToAllStudentsAction } from "@/app/actions/teacher/notifications";
import { sendMessageToAdvisorAction } from "@/app/actions/teacher/send-to-advisor";
import { format } from "date-fns";

const { TextArea } = Input;

type Student = { id: string; name: string | null; email: string };
type SentMessage = { id: string; receiverName: string | null; receiverRole: string; message: string; isRead: boolean; createdAt: string };

type Props = {
  data: {
    students: Student[];
    sentMessages: SentMessage[];
  };
};

const ROLE_LABEL: Record<string, string> = { STUDENT: "طالب", TEACHER: "مدرس", ADVISOR: "مرشد", ADMIN: "أدمن", TA: "معيد" };

export default function MessagesClient({ data }: Props) {
  const [msgApi, contextHolder] = message.useMessage();
  const [selectedStudent, setSelectedStudent] = useState<string>();
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendToStudent = async () => {
    if (!selectedStudent) { msgApi.warning("اختر طالب أولاً"); return; }
    if (!messageText.trim()) { msgApi.warning("اكتب الرسالة"); return; }
    setLoading(true);
    const res = await sendNotificationToStudentAction({ receiverId: selectedStudent, message: messageText });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false);
    if (res.success) setMessageText("");
  };

  const handleSendToAll = async () => {
    if (!messageText.trim()) { msgApi.warning("اكتب الرسالة"); return; }
    setLoading(true);
    const res = await sendNotificationToAllStudentsAction({ message: messageText });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false);
    if (res.success) setMessageText("");
  };

  const handleSendToAdvisor = async () => {
    if (!selectedStudent) { msgApi.warning("اختر الطالب المعني أولاً"); return; }
    if (!messageText.trim()) { msgApi.warning("اكتب الرسالة"); return; }
    setLoading(true);
    const res = await sendMessageToAdvisorAction({ studentId: selectedStudent, message: messageText });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false);
    if (res.success) setMessageText("");
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>الرسائل والإشعارات</h1>
        <p className="text-sm text-slate-500 mt-1">إرسال رسائل للطلاب أو للمرشد الأكاديمي</p>
      </div>

      <Card className="rounded-2xl shadow-sm" title={<span className="flex items-center gap-2"><Send size={16} color="#F58220" /> إرسال رسالة جديدة</span>}>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">اختر الطالب</label>
            <Select
              showSearch
              size="large"
              className="w-full"
              placeholder="اختر طالب..."
              value={selectedStudent}
              onChange={setSelectedStudent}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={data.students.map((s) => ({
                label: `${s.name || "بدون اسم"} — ${s.email}`,
                value: s.id,
              }))}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">الرسالة</label>
            <TextArea rows={4} placeholder="اكتب رسالتك هنا..." value={messageText} onChange={(e) => setMessageText(e.target.value)} />
          </div>

          <Divider />

          <Space wrap>
            <Button type="primary" size="large" icon={<MessageSquare size={16} />} loading={loading} onClick={handleSendToStudent} style={{ borderRadius: 12 }}>
              إرسال للطالب المحدد
            </Button>
            <Button size="large" icon={<Users size={16} />} loading={loading} onClick={handleSendToAll} style={{ borderRadius: 12, borderColor: "#F58220", color: "#F58220" }}>
              إرسال لجميع الطلاب
            </Button>
            <Button size="large" icon={<UserCheck size={16} />} loading={loading} onClick={handleSendToAdvisor} style={{ borderRadius: 12, borderColor: "#002060", color: "#002060" }}>
              إرسال للمرشد الأكاديمي
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-sm" title="الرسائل المرسلة سابقاً">
        {data.sentMessages.length === 0 ? (
          <Empty description="لا توجد رسائل مرسلة" />
        ) : (
          <Table
            rowKey="id"
            dataSource={data.sentMessages}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: "المستلم", dataIndex: "receiverName", render: (v: string | null) => v || "بدون اسم" },
              { title: "الدور", dataIndex: "receiverRole", render: (v: string) => <Tag color={v === "STUDENT" ? "green" : v === "ADVISOR" ? "purple" : "blue"}>{ROLE_LABEL[v] || v}</Tag> },
              { title: "الرسالة", dataIndex: "message", ellipsis: true },
              { title: "مقروءة؟", dataIndex: "isRead", render: (v: boolean) => v ? <Tag color="green">نعم</Tag> : <Tag color="orange">لا</Tag> },
              { title: "الوقت", dataIndex: "createdAt", render: (v: string) => { try { return format(new Date(v), "yyyy-MM-dd HH:mm"); } catch { return "-"; } } },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
