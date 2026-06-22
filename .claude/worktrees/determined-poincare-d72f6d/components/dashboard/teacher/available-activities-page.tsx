"use client";

import { Card, Tag, Empty, Row, Col, Typography, Button, Space, Select } from "antd";

import { ClipboardList, BookOpen, Clock3, Trophy } from "lucide-react";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  stats: {
    total: number;
    active: number;
    overdue: number;
    courses: number;
  };

  activities: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    points: number;
    dueDate: string | null;
    createdAt: string;
    overdue: boolean;

    course: {
      id: string;
      name: string;
      code: string;
      students: number;
    };
  }[];
};

const { Title } = Typography;

export default function TeacherAvailableActivitiesPage({
  stats,
  activities,
}: Props) {
  const router = useRouter();
  if (activities.length === 0) {
    return (
      <>
        <Space
          orientation="horizontal"
          className="justify-between items-center w-full mb-4"
        >
          <Title level={3}>الأنشطة المتاحة</Title>
          <Button>
            <Link href="/teacher/activities/new">إنشاء نشاط جديد</Link>
          </Button>
        </Space>
        <Card className="rounded-2xl shadow-sm">
          <Empty description="لا توجد أنشطة حالياً" />
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Space
          orientation="horizontal"
          className="justify-between items-center w-full mb-4"
        >
          <Title level={3}>الأنشطة المتاحة</Title>
          <Space>

          <Button>
            <Link href="/teacher/activities/new">إنشاء نشاط جديد</Link>
          </Button>
          <Button>
            <Link href="/teacher/activities/progress">تقارير الأنشطة</Link>
          </Button>
          </Space>
        </Space>

        <p className="text-sm text-slate-500 mt-1">جميع الأنشطة المنشورة</p>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">الإجمالي</div>

            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">النشطة</div>

            <div className="text-2xl font-bold mt-2 text-green-600">
              {stats.active}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">المنتهية</div>

            <div className="text-2xl font-bold mt-2 text-red-600">
              {stats.overdue}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm text-slate-500">الكورسات</div>

            <div className="text-2xl font-bold mt-2">{stats.courses}</div>
          </Card>
        </Col>
      </Row>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {activities.map((item) => (
          <Card key={item.id} className="rounded-2xl shadow-sm">
            <div className="space-y-4">
              {/* Top */}
              <div className="flex justify-between gap-3">
                <div className="flex gap-2">
                  <ClipboardList size={18} />

                  <div>
                    <div className="font-bold text-lg">{item.title}</div>

                    <div className="text-xs text-slate-500">
                      {format(new Date(item.createdAt), "yyyy-MM-dd")}
                    </div>
                  </div>
                </div>

                <Tag color="blue">{item.type}</Tag>
              </div>

              {/* Course */}
              <div className="flex gap-2 items-center text-sm text-slate-600">
                <BookOpen size={16} />
                {item.course.name} ({item.course.code})
              </div>

              {/* Desc */}
              {item.description && (
                <p className="text-sm text-slate-600">{item.description}</p>
              )}

              {/* Footer */}
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <Tag color="gold">
                    <Trophy size={13} /> {item.points}
                  </Tag>

                  <Tag color="purple">{item.course.students} طالب</Tag>
                </div>

                {item.dueDate && (
                  <Tag color={item.overdue ? "red" : "cyan"}>
                    <Clock3 size={13} />{" "}
                    {format(new Date(item.dueDate), "yyyy-MM-dd")}
                  </Tag>
                )}
                <Select
                  placeholder="اختر إجراء"
                  style={{ width: 180 }}
                  size="small"
                  onChange={(value) => {
                    router.push(value);
                  }}
                  options={[
                    {
                      label: "تعديل",
                      value: `/teacher/activities/${item.id}/edit`,
                    },
                    {
                      label: "إضافة محتوى",
                      value: `/teacher/activities/${item.id}/content`,
                    },
                    
                  ]}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
