"use client";

import {
  Users,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Card, Progress, Tag, Avatar, Button } from "antd";
import { format } from "date-fns";
import Link from "next/link";
type Stats = {
  usersCount: number;
  coursesCount: number;
  activeCourses: number;
  teachersCount: number;
};

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  createdAt: Date;
};

type CourseItem = {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  teacherName?: string;
};

type ActivityItem = {
  id: string;
  action: string;
  description?: string | null;
  createdAt: string;
};

type Props = {
  stats: Stats;
  users: UserItem[];
  courses: CourseItem[];
  activities: ActivityItem[];
};

export default function AdminDashboard({
  stats,
  users,
  courses,
  activities,
}: Props) {
  const statCards = [
    {
      label: "إجمالي المستخدمين",
      value: stats.usersCount,
      icon: Users,
      color: "#6366f1",
      change: "+12%",
      up: true,
    },
    {
      label: "الطلاب",
      value: stats.coursesCount,
      icon: GraduationCap,
      color: "#10b981",
      change: "+8%",
      up: true,
    },
    {
      label: "المدرسين",
      value: stats.teachersCount,
      icon: ShieldCheck,
      color: "#f59e0b",
      change: "+3%",
      up: true,
    },
    {
      label: "الكورسات",
      value: stats.coursesCount,
      icon: BookOpen,
      color: "#8b5cf6",
      change: "-1%",
      up: false,
    },
  ];

  const roleLabel = {
    ADMIN: "أدمن",
    TEACHER: "مدرس",
    STUDENT: "طالب",
  };

  const roleColor = {
    ADMIN: "red",
    TEACHER: "blue",
    STUDENT: "green",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
            مرحباً بك في لوحة التحكم 
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          نظرة عامة على النظام والبيانات الحالية
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="rounded-2xl border-0 shadow-sm"
              style={{ padding: 20 }}
            >
              <div className="flex justify-between items-start">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: item.color + "20",
                  }}
                >
                  <Icon size={20} color={item.color} />
                </div>

                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 ${
                    item.up
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {item.up ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {item.change}
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-2xl font-bold text-slate-800">
                  {item.value}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{item.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Users */}
        <Card
          className="xl:col-span-2 rounded-2xl shadow-sm"
          title="أحدث المستخدمين"
          extra={
            <>
          <Button type="link">
            <Link href="/admin/students">عرض الطلاب</Link>
          </Button>
          <Button type="link">
            <Link href="/admin/teachers">عرض المدرسين</Link>
          </Button>
            </>
        }
        >
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
              >
                <Avatar className="bg-indigo-500">
                  {user.name?.charAt(0) || "U"}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {user.name || "بدون اسم"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>

                <Tag color={roleColor[user.role]}>
                  {roleLabel[user.role]}
                </Tag>

                <span className="text-xs text-slate-400">
                  {format(new Date(user.createdAt), "yyyy-MM-dd")}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Activities */}
        <Card
          className="rounded-2xl shadow-sm"
          title="النشاط الأخير"
        >
          <div className="space-y-4">
            {activities.map((item, i) => {
              const Icon =
                i % 3 === 0
                  ? CheckCircle2
                  : i % 3 === 1
                  ? AlertCircle
                  : Eye;

              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Icon size={14} className="text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-slate-700">
                      {item.description || item.action}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm" )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Courses */}
      <Card
        className="rounded-2xl shadow-sm"
        title="الكورسات"
        extra={<Button type="link">
            <Link href="/admin/courses">عرض الكل</Link>
        </Button>}
      >
        <div className="space-y-4">
          {courses.map((course) => {
            const percent = Math.min(course.studentsCount, 100);

            return (
              <div
                key={course.id}
                className="p-4 rounded-xl bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {course.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {course.code} · {course.teacherName || "بدون مدرس"} ·{" "}
                      {course.studentsCount} طالب
                    </p>
                  </div>

                  <Tag color="blue">نشط</Tag>
                </div>

                <div className="mt-3">
                  <Progress percent={percent} showInfo={false} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}