"use client";

import { useMemo, useState } from "react";
import {
  Card,
  Table,
  Input,
  Tag,
  Avatar,
  Button,
  Select,
  Modal,
  message,
  Space,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, CreditCard, Link2, UserPlus, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { generateRfidCardAction, mapRfidCardAction } from "@/app/actions/admin/rfid";
import Link from "next/link";

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "TA" | "STUDENT" | "ADVISOR";
  studentCode: string | null;
  createdAt: string;
  enrollmentsCount: number;
  attendancesCount: number;
};

type Props = { users: UserItem[] };

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "أدمن",
  TEACHER: "مدرس",
  TA: "معيد",
  STUDENT: "طالب",
  ADVISOR: "مرشد",
};
const ROLE_COLOR: Record<string, string> = {
  ADMIN: "red",
  TEACHER: "blue",
  TA: "cyan",
  STUDENT: "green",
  ADVISOR: "purple",
};

// Academic year levels derived from studentCode prefix convention (optional filter)
const YEAR_OPTIONS = [
  { label: "الكل", value: "ALL" },
  { label: "السنة الأولى", value: "1" },
  { label: "السنة الثانية", value: "2" },
  { label: "السنة الثالثة", value: "3" },
  { label: "السنة الرابعة", value: "4" },
];

export default function UsersClient({ users }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [rfidStudent, setRfidStudent] = useState<UserItem | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentCode?.toLowerCase().includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      // Year filter: match first digit of studentCode if student
      const matchYear =
        yearFilter === "ALL" ||
        (u.role === "STUDENT" && u.studentCode?.startsWith(yearFilter));
      return matchSearch && matchRole && matchYear;
    });
  }, [search, roleFilter, yearFilter, users]);

  const handleGenerate = async (student: UserItem) => {
    setLoading(true);
    const res = await generateRfidCardAction(student.id);
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false);
    setRfidStudent(null);
  };

  const handleMap = async () => {
    if (!rfidStudent) return;
    setLoading(true);
    const res = await mapRfidCardAction(rfidStudent.id, manualCode);
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false);
    setRfidStudent(null);
    setManualCode("");
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "المستخدم",
      key: "user",
      render: (_, u) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: "#002060" }}>
            {u.name?.charAt(0) || "U"}
          </Avatar>
          <div>
            <div className="font-semibold" style={{ color: "#002060" }}>
              {u.name || "بدون اسم"}
            </div>
            <div className="text-xs text-slate-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "الدور",
      dataIndex: "role",
      render: (role: string) => (
        <Tag color={ROLE_COLOR[role]}>{ROLE_LABEL[role]}</Tag>
      ),
    },
    {
      title: "كود RFID",
      dataIndex: "studentCode",
      render: (code: string | null, record) =>
        record.role === "STUDENT" ? (
          code ? (
            <Tag color="orange">{code}</Tag>
          ) : (
            <Tag color="default">غير مربوط</Tag>
          )
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: "الكورسات",
      dataIndex: "enrollmentsCount",
      align: "center",
      render: (v: number) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "الحضور",
      dataIndex: "attendancesCount",
      align: "center",
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: "تاريخ التسجيل",
      dataIndex: "createdAt",
      render: (v: string) => (
        <span className="text-sm text-slate-500">
          {format(new Date(v), "yyyy-MM-dd")}
        </span>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.role === "STUDENT" && (
            <>
              <Tooltip title="توليد كود تلقائي">
                <Button
                  size="small"
                  type="primary"
                  style={{ background: "#F58220", borderColor: "#F58220" }}
                  icon={<CreditCard size={13} />}
                  loading={loading}
                  onClick={() => handleGenerate(record)}
                />
              </Tooltip>
              <Tooltip title="ربط كود يدوي">
                <Button
                  size="small"
                  style={{ borderColor: "#002060", color: "#002060" }}
                  icon={<Link2 size={13} />}
                  onClick={() => { setRfidStudent(record); setManualCode(""); }}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="إعادة تعيين كلمة المرور (إلى 123456)">
            <Button
              size="small"
              type="primary"
              danger
              icon={<KeyRound size={13} />}
              loading={loading}
              onClick={async () => {
                setLoading(true);
                const { resetAnyUserPasswordAction } = await import("@/app/actions/admin/reset-password");
                const res = await resetAnyUserPasswordAction(record.id);
                if (res.success) {
                  msgApi.success(res.message);
                } else {
                  msgApi.error(res.message);
                }
                setLoading(false);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
            سجل المستخدمين
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            جميع المستخدمين المسجلين مع إدارة بطاقات RFID
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button type="primary" icon={<UserPlus size={16} />} size="large" style={{ borderRadius: 12, fontWeight: 700 }}>
            إنشاء مستخدم جديد
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["STUDENT", "TEACHER", "TA", "ADVISOR", "ADMIN"] as const).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <Card
              key={role}
              className="rounded-2xl shadow-sm border-0"
              style={{ borderTop: `3px solid ${ROLE_COLOR[role] === "green" ? "#10b981" : ROLE_COLOR[role] === "blue" ? "#3b82f6" : ROLE_COLOR[role] === "purple" ? "#8b5cf6" : "#ef4444"}` }}
            >
              <div className="text-sm text-slate-500">{ROLE_LABEL[role]}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: "#002060" }}>{count}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 mb-5">
          <Input
            size="large"
            placeholder="ابحث بالاسم أو البريد أو الكود..."
            prefix={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select
            size="large"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 160 }}
            options={[
              { label: "كل الأدوار", value: "ALL" },
              { label: "طلاب", value: "STUDENT" },
              { label: "مدرسين", value: "TEACHER" },
              { label: "معيدين", value: "TA" },
              { label: "مرشدين", value: "ADVISOR" },
              { label: "أدمن", value: "ADMIN" },
            ]}
          />
          <Select
            size="large"
            value={yearFilter}
            onChange={setYearFilter}
            style={{ width: 180 }}
            options={YEAR_OPTIONS}
          />
          <span className="text-sm text-slate-500 self-center">
            النتائج: {filtered.length}
          </span>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Manual RFID Map Modal */}
      <Modal
        title={`ربط كود RFID — ${rfidStudent?.name || ""}`}
        open={!!rfidStudent}
        onCancel={() => setRfidStudent(null)}
        onOk={handleMap}
        confirmLoading={loading}
        okText="ربط"
        cancelText="إلغاء"
      >
        <div className="space-y-3 mt-2">
          <p className="text-sm text-slate-500">
            أدخل كود RFID المقروء من البطاقة الفعلية (مثال: A1B2C3D4)
          </p>
          <Input
            size="large"
            placeholder="كود RFID"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            maxLength={16}
          />
        </div>
      </Modal>
    </div>
  );
}
