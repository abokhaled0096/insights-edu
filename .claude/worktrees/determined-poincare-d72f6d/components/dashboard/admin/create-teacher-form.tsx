"use client";

import { useActionState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  message,
} from "antd";
import {
  User,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";

type State = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const initialState: State = {};

export default function CreateTeacherForm({
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
        state.message || "تم الإنشاء بنجاح"
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
    <div className="max-w-3xl mx-auto">
      {contextHolder}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          إنشاء مدرس جديد
        </h1>
        <p className="text-slate-500 mt-1">
          أضف حساب مدرس جديد للنظام
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <form
          action={formAction}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              الاسم الكامل
            </label>

            <Input
              name="name"
              size="large"
              prefix={<User size={16} />}
              placeholder="أدخل الاسم"
            />

            {state.errors?.name && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              البريد الإلكتروني
            </label>

            <Input
              name="email"
              size="large"
              prefix={<Mail size={16} />}
              placeholder="teacher@email.com"
            />

            {state.errors?.email && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">
              كلمة المرور
            </label>

            <Input.Password
              name="password"
              size="large"
              prefix={<Lock size={16} />}
              placeholder="******"
            />

            {state.errors?.password && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 pt-3 flex justify-end">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={pending}
              icon={<UserPlus size={16} />}
              className="px-8"
            >
              إنشاء المدرس
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}