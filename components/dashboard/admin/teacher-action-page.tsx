"use client";

// components/dashboard/admin/teacher-actions-page.tsx

import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Button,
  Space,
  Divider,
  message,
} from "antd";

import {
  Trash2,
  KeyRound,
  Shield,
  BookOpen,
} from "lucide-react";

import {
  deleteTeacherAction,
  resetTeacherPasswordAction,
  makeTeacherAdminAction,
  removeTeacherCoursesAction,
} from "@/app/actions/admin/teacher";
import { useSearchParams } from "next/dist/client/components/navigation";

type Teacher = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  teachers: Teacher[];
};

export default function TeacherActionsPage({
  teachers,
}: Props) {
  const [teacherId, setTeacherId] =
    useState<string>();
    const searchParams = useSearchParams();
  const [loading, setLoading] =
    useState(false);

  const [msgApi, contextHolder] =
    message.useMessage();

    useEffect(() => {
      const id =
        searchParams.get("id") ||
        undefined;
        if (id) setTeacherId(id);
    }, [searchParams]);
  const runAction = async (
    action: (
      id: string
    ) => Promise<{
      success: boolean;
      message: string;
    }>
  ) => {
    if (!teacherId) {
      msgApi.warning(
        "اختر مدرس أولاً"
      );
      return;
    }

    setLoading(true);

    const res =
      await action(
        teacherId
      );

    if (res.success) {
      msgApi.success(
        res.message
      );
    } else {
      msgApi.error(
        res.message
      );
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {contextHolder}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          إجراءات المدرسين
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          تنفيذ إجراءات
          سريعة على المدرسين
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              اختر المدرس
            </label>

            <Select
              showSearch
              size="large"
              className="w-full"
              placeholder="اختر مدرس"
              value={teacherId}
              onChange={
                setTeacherId
              }
              options={teachers.map(
                (
                  teacher
                ) => ({
                  label: `${teacher.name} - ${teacher.email}`,
                  value:
                    teacher.id,
                })
              )}
            />
          </div>

          <Divider />

          <Space
            orientation="vertical"
            className="w-full"
            size="middle"
          >
            <Button
              block
              size="large"
              icon={
                <KeyRound
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  resetTeacherPasswordAction
                )
              }
            >
              إعادة تعيين كلمة المرور
            </Button>

            <Button
              block
              size="large"
              icon={
                <Shield
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  makeTeacherAdminAction
                )
              }
            >
              تحويل إلى أدمن
            </Button>

            <Button
              block
              size="large"
              icon={
                <BookOpen
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  removeTeacherCoursesAction
                )
              }
            >
              فك ربط الكورسات
            </Button>

            <Button
              danger
              block
              size="large"
              icon={
                <Trash2
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  deleteTeacherAction
                )
              }
            >
              حذف المدرس
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}