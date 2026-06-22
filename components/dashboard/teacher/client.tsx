"use client";

// components/dashboard/teacher/dashboard-page.tsx

import {
  Card,
  Table,
  Tag,
  Progress,
} from "antd";

import {
  BookOpen,
  Users,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { format } from "date-fns";

type CourseStat = {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  attendanceRate: number;
  avgScore: number;
  submissionRate: number;
  avgAssignmentGrade: number;
};

type Props = {
  data: {
    stats: {
      courses: number;
      students: number;
      todayAttendance: number;
      activeSession: number;
    };

    courses: {
      id: string;
      name: string;
      code: string;
      students: number;
    }[];

    recentAttendance: {
      id: string;
      student: string;
      code: string;
      course: string;
      createdAt: string;
    }[];

    courseStats?: CourseStat[];

    atRiskStudents?: {
      id: string;
      name: string | null;
      email: string;
      courses: string[];
      aiReasons: string[];
      aiRecommendations: string[];
    }[];
  };
};

export default function TeacherDashboardPage({
  data,
}: Props) {
  const cards = [
    {
      title:
        "كورساتي",
      value:
        data.stats
          .courses,
      icon: (
        <BookOpen
          size={18}
        />
      ),
    },

    {
      title:
        "طلابي",
      value:
        data.stats
          .students,
      icon: (
        <Users
          size={18}
        />
      ),
    },

    {
      title:
        "حضور اليوم",
      value:
        data.stats
          .todayAttendance,
      icon: (
        <CheckCircle
          size={18}
        />
      ),
    },

    {
      title:
        "جلسة نشطة",
      value:
        data.stats
          .activeSession,
      icon: (
        <PlayCircle
          size={18}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          لوحة المدرس
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          ملخص سريع
          وإحصائيات
          اليوم
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(
          (card) => (
            <Card
              key={
                card.title
              }
              className="rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-500">
                    {
                      card.title
                    }
                  </div>

                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {
                      card.value
                    }
                  </div>
                </div>

                <div className="text-slate-500">
                  {
                    card.icon
                  }
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      {/* At Risk Students - Early Warning */}
      {data.atRiskStudents && data.atRiskStudents.length > 0 && (
        <Card
          title={
            <span className="flex items-center gap-2 text-red-600 animate-pulse">
              <AlertTriangle size={20} />
              تدخل مبكر: طلاب مسجلون لديك يواجهون تعثراً أكاديمياً (على مستوى النظام)
            </span>
          }
          className="rounded-3xl shadow-lg border border-red-200 backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.8))", borderRight: "6px solid #ef4444" }}
        >
          <div className="mb-4 p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-100 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              <strong>ملاحظة هامة:</strong> هذا التقييم والأسباب المذكورة تعكس الأداء الأكاديمي الشامل للطالب في <strong>جميع مواده الدراسية</strong> المحللة بواسطة الذكاء الاصطناعي، وليس بالضرورة مقصوراً على مقرراتك فقط.
            </p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {data.atRiskStudents.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{s.name || "بدون اسم"}</h3>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <Tag color="red">خطر عام</Tag>
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  <span className="font-semibold">مسجل لديك في:</span> {s.courses.join("، ")}
                </div>
                
                {s.aiReasons.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-700">أسباب التعثر (عام):</span>
                    <ul className="list-disc list-inside text-xs text-slate-600">
                      {s.aiReasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Courses */}
      <Card
        title="كورساتي"
        className="rounded-2xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.courses.map(
            (
              course
            ) => (
              <Card
                key={
                  course.id
                }
                size="small"
              >
                <div className="font-semibold">
                  {
                    course.name
                  }
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  {
                    course.code
                  }
                </div>

                <Tag
                  color="blue"
                  className="mt-3"
                >
                  {
                    course.students
                  }{" "}
                  طالب
                </Tag>
              </Card>
            )
          )}
        </div>
      </Card>

      {/* Per-Course Performance Stats */}
      {data.courseStats && data.courseStats.length > 0 && (
        <Card
          title={
            <span className="flex items-center gap-2">
              <TrendingUp size={16} color="#F58220" />
              إحصائيات الأداء لكل كورس
            </span>
          }
          className="rounded-2xl shadow-sm"
        >
          <div className="space-y-6">
            {data.courseStats.map((cs) => (
              <div
                key={cs.id}
                className="p-4 rounded-xl"
                style={{ background: "#F8F9FC", border: "1px solid #E5E7EB" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-base" style={{ color: "#002060" }}>
                      {cs.name}
                    </span>
                    <Tag color="orange" className="mr-2">{cs.code}</Tag>
                  </div>
                  <Tag color="blue">{cs.studentsCount} طالب</Tag>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">نسبة الحضور</span>
                      <span
                        className="font-semibold"
                        style={{ color: cs.attendanceRate >= 75 ? "#10b981" : cs.attendanceRate >= 50 ? "#f59e0b" : "#ef4444" }}
                      >
                        {cs.attendanceRate}%
                      </span>
                    </div>
                    <Progress
                      percent={cs.attendanceRate}
                      showInfo={false}
                      strokeColor={cs.attendanceRate >= 75 ? "#10b981" : cs.attendanceRate >= 50 ? "#f59e0b" : "#ef4444"}
                      railColor="#E5E7EB"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">متوسط درجات الامتحانات</span>
                      <span
                        className="font-semibold"
                        style={{ color: cs.avgScore >= 60 ? "#10b981" : "#ef4444" }}
                      >
                        {cs.avgScore}/100
                      </span>
                    </div>
                    <Progress
                      percent={cs.avgScore}
                      showInfo={false}
                      strokeColor={cs.avgScore >= 60 ? "#002060" : "#ef4444"}
                      railColor="#E5E7EB"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">نسبة تسليم الواجبات</span>
                      <span
                        className="font-semibold"
                        style={{ color: cs.submissionRate >= 70 ? "#10b981" : "#f59e0b" }}
                      >
                        {cs.submissionRate}%
                      </span>
                    </div>
                    <Progress
                      percent={cs.submissionRate}
                      showInfo={false}
                      strokeColor="#F58220"
                      railColor="#E5E7EB"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">متوسط درجات الواجبات</span>
                      <span
                        className="font-semibold"
                        style={{ color: cs.avgAssignmentGrade >= 60 ? "#10b981" : "#ef4444" }}
                      >
                        {cs.avgAssignmentGrade}/100
                      </span>
                    </div>
                    <Progress
                      percent={cs.avgAssignmentGrade}
                      showInfo={false}
                      strokeColor={cs.avgAssignmentGrade >= 60 ? "#8b5cf6" : "#ef4444"}
                      railColor="#E5E7EB"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Attendance */}
      <Card
        title="آخر الحضور"
        className="rounded-2xl shadow-sm"
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={data.recentAttendance}
          columns={[
            { title: "الطالب", dataIndex: "student" },
            { title: "الكود",  dataIndex: "code" },
            { title: "الكورس", dataIndex: "course" },
            {
              title: "الوقت",
              dataIndex: "createdAt",
              render: (value) => format(new Date(value), "yyyy-MM-dd HH:mm"),
            },
          ]}
        />
      </Card>
    </div>
  );
}