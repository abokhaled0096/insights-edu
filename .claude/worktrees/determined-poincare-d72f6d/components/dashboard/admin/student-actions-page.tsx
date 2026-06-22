"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Button,
  message,
  Space,
  Divider,
} from "antd";

import {
  Trash2,
  KeyRound,
  UserCog,
  ScanLine,
} from "lucide-react";

import {
  deleteStudentAction,
  resetStudentPasswordAction,
  removeStudentCodeAction,
  makeTeacherAction,
} from "@/app/actions/admin/student";
import { useSearchParams } from "next/navigation";

type Student = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  students: Student[];
};

export default function StudentActionsPage({
  students,
}: Props) {
  const [studentId, setStudentId] =
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
        if (id) setStudentId(id);
    }, [searchParams]);
  const runAction = async (
    action: (
      id: string
    ) => Promise<{
      success: boolean;
      message: string;
    }>
  ) => {
    if (!studentId) {
      msgApi.warning(
        "اختر طالب أولاً"
      );
      return;
    }

    setLoading(true);

    const res =
      await action(studentId);

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
          إجراءات الطلاب
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          تنفيذ إجراءات سريعة
          على الطالب
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              اختر الطالب
            </label>

            <Select
              showSearch
              size="large"
              className="w-full"
              placeholder="اختر طالب"
              value={studentId}
              onChange={
                setStudentId
              }
              options={students.map(
                (
                  student
                ) => ({
                  label: `${student.name} - ${student.email}`,
                  value:
                    student.id,
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
                  resetStudentPasswordAction
                )
              }
            >
              إعادة تعيين كلمة المرور
            </Button>

            <Button
              block
              size="large"
              icon={
                <ScanLine
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  removeStudentCodeAction
                )
              }
            >
              حذف Student Code
            </Button>

            <Button
              block
              size="large"
              icon={
                <UserCog
                  size={16}
                />
              }
              loading={
                loading
              }
              onClick={() =>
                runAction(
                  makeTeacherAction
                )
              }
            >
              تحويل إلى مدرس
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
                  deleteStudentAction
                )
              }
            >
              حذف الطالب
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}