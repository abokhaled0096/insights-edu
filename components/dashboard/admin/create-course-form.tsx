"use client";

// app/(dashboard)/admin/courses/new/create-course-form.tsx

import { useActionState, useEffect } from "react";
import { Card, Input, Button, message } from "antd";

type State = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const initialState: State = {};

export default function CreateCourseForm({
  action,
}: {
  action: (
    prevState: State,
    formData: FormData
  ) => Promise<State>;
}) {
  const [state, formAction, pending] =
    useActionState(action, initialState);

  const [msgApi, contextHolder] =
    message.useMessage();

  useEffect(() => {
    if (state.success) {
      msgApi.success(
        state.message ||
          "تم إنشاء الكورس بنجاح"
      );
    }

    if (
      state.success === false &&
      state.message
    ) {
      msgApi.error(state.message);
    }
  }, [state, msgApi]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {contextHolder}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          إنشاء كورس جديد
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          أضف مادة جديدة إلى النظام
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <form
          action={formAction}
          className="space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              اسم الكورس
            </label>

            <Input
              name="name"
              size="large"
              placeholder="مثال: قواعد البيانات"
            />

            {state.errors?.name && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Code */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              كود المادة
            </label>

            <Input
              name="code"
              size="large"
              placeholder="CS101"
            />

            {state.errors?.code && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.code[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              الوصف
            </label>

            <Input.TextArea
              rows={4}
              name="description"
              placeholder="وصف مختصر للكورس"
            />

            {state.errors?.description && (
              <p className="text-red-500 text-xs mt-1">
                {
                  state.errors
                    .description[0]
                }
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={pending}
              className="px-8"
            >
              إنشاء الكورس
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}