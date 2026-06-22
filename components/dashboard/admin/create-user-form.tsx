"use client";

import { useActionState } from "react";
import { Card, Input, Button, Select, message, Alert } from "antd";
import { UserPlus, ArrowRight } from "lucide-react";
import { createUserAction } from "@/app/actions/admin/create-user";
import Link from "next/link";
import { useEffect, useRef } from "react";

const roleOptions = [
  { value: "STUDENT", label: "طالب" },
  { value: "TEACHER", label: "مدرس" },
  { value: "TA", label: "معيد (Teaching Assistant)" },
  { value: "ADVISOR", label: "مرشد أكاديمي" },
  { value: "ADMIN", label: "مسؤول نظام (Admin)" },
];

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, null);
  const [msgApi, contextHolder] = message.useMessage();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      msgApi.success(state.message);
      formRef.current?.reset();
    } else if (state && !state.success && state.message) {
      msgApi.error(state.message);
    }
  }, [state, msgApi]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
            إنشاء مستخدم جديد
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إضافة حساب جديد للنظام (سيُطلب من المستخدم تغيير كلمة المرور عند أول دخول)
          </p>
        </div>
        <Link href="/admin/users">
          <Button icon={<ArrowRight size={14} />}>العودة</Button>
        </Link>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
            <Input name="name" size="large" placeholder="أدخل الاسم الكامل" required />
            {state?.errors?.name && (
              <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني الأكاديمي</label>
            <Input name="email" type="email" size="large" placeholder="user@edu.com" required />
            {state?.errors?.email && (
              <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور المبدئية</label>
            <Input.Password name="password" size="large" placeholder="كلمة مرور مؤقتة (6+ أحرف)" required />
            {state?.errors?.password && (
              <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الدور</label>
            <Select
              style={{ width: "100%" }}
              size="large"
              placeholder="اختر الدور"
              options={roleOptions}
              onChange={(value) => {
                // Hidden input workaround for form action
                const hidden = document.querySelector('input[name="role"]') as HTMLInputElement;
                if (hidden) hidden.value = value;
              }}
            />
            <input type="hidden" name="role" defaultValue="" />
            {state?.errors?.role && (
              <p className="text-red-500 text-xs mt-1">{state.errors.role[0]}</p>
            )}
          </div>

          <Alert
            type="info"
            showIcon
            title="سيُطلب من المستخدم تغيير كلمة المرور عند أول تسجيل دخول"
            className="rounded-xl"
          />

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isPending}
            icon={<UserPlus size={16} />}
            style={{ height: 48, borderRadius: 12, fontWeight: 700 }}
          >
            إنشاء الحساب
          </Button>
        </form>
      </Card>
    </div>
  );
}
