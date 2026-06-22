"use client";

import { Card, Table, Tag, Statistic, Row, Col } from "antd";
import { CheckCircle, XCircle, BarChart3, CalendarDays } from "lucide-react";
import { format } from "date-fns";

type Record = {
  id: string;
  courseName: string;
  courseCode: string;
  status: string;
  date: string;
};

type Props = {
  records: Record[];
  stats: { total: number; present: number; absent: number; rate: number };
};

export default function StudentAttendanceClient({ records, stats }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
          سجل الحضور
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          متابعة حضورك وغيابك في جميع المقررات
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="إجمالي"
              value={stats.total}
              prefix={<CalendarDays size={16} className="inline" />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="حضور"
              value={stats.present}
              styles={{ content: { color: "#10b981" } }}
              prefix={<CheckCircle size={16} className="inline" />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="غياب"
              value={stats.absent}
              styles={{ content: { color: "#ef4444" } }}
              prefix={<XCircle size={16} className="inline" />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-2xl shadow-sm text-center">
            <Statistic
              title="نسبة الحضور"
              value={stats.rate}
              suffix="%"
              styles={{ content: { color: stats.rate >= 75 ? "#10b981" : "#ef4444" } }}
              prefix={<BarChart3 size={16} className="inline" />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          dataSource={records}
          pagination={{ pageSize: 15 }}
          columns={[
            {
              title: "المادة",
              dataIndex: "courseName",
              render: (_: string, r: Record) => (
                <span>
                  {r.courseName} <Tag color="blue">{r.courseCode}</Tag>
                </span>
              ),
            },
            {
              title: "الحالة",
              dataIndex: "status",
              filters: [
                { text: "حاضر", value: "PRESENT" },
                { text: "غائب", value: "ABSENT" },
                { text: "مرفوض", value: "REJECTED" },
              ],
              onFilter: (value, record) => record.status === value,
              render: (status: string) => (
                <Tag
                  color={
                    status === "PRESENT"
                      ? "green"
                      : status === "ABSENT"
                        ? "red"
                        : "orange"
                  }
                >
                  {status === "PRESENT"
                    ? "حاضر"
                    : status === "ABSENT"
                      ? "غائب"
                      : "مرفوض"}
                </Tag>
              ),
            },
            {
              title: "التاريخ",
              dataIndex: "date",
              render: (v: string) => format(new Date(v), "yyyy-MM-dd HH:mm"),
              sorter: (a: Record, b: Record) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
              defaultSortOrder: "descend",
            },
          ]}
        />
      </Card>
    </div>
  );
}
