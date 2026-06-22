"use client";

import { useActionState, useEffect } from "react";
import { Button, Card, Input, Form, message } from "antd";
import { BookOpen, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateCourseAction } from "@/app/actions/admin/update-course";
import Link from "next/link";

type Course = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

export default function EditCourseClient({ course }: { course: Course }) {
  const router = useRouter();
  const [msgApi, contextHolder] = message.useMessage();
  const [state, formAction, isPending] = useActionState(updateCourseAction, {});

  useEffect(() => {
    if (state.success) {
      msgApi.success(state.message);
      setTimeout(() => {
        router.push("/admin/courses");
      }, 1000);
    } else if (state.success === false && state.errors?.general) {
      msgApi.error(state.errors.general[0]);
    }
  }, [state, msgApi, router]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {contextHolder}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BookOpen className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تعديل الكورس</h1>
          <p className="text-sm text-slate-500">
            تحديث بيانات الكورس: {course.name}
          </p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={course.id} />

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              اسم الكورس <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              size="large"
              defaultValue={course.name}
              status={state.errors?.name ? "error" : ""}
            />
            {state.errors?.name && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {state.errors.name[0]}
              </div>
            )}
          </div>

          {/* Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              كود المادة <span className="text-red-500">*</span>
            </label>
            <Input
              name="code"
              size="large"
              dir="ltr"
              defaultValue={course.code}
              status={state.errors?.code ? "error" : ""}
            />
            {state.errors?.code && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {state.errors.code[0]}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">
              يجب أن يكون فريداً باللغة الإنجليزية (مثال: CS101)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              وصف الكورس
            </label>
            <Input.TextArea
              name="description"
              size="large"
              rows={4}
              defaultValue={course.description || ""}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={isPending}
              className="px-8 font-semibold bg-blue-600 hover:bg-blue-700"
            >
              حفظ التعديلات
            </Button>

            <Link href="/admin/courses">
              <Button size="large" type="default" className="px-6 font-medium">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
