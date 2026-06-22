"use client";

import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { AuthWrapper } from "@/components/auth/authWrapper";
import { registerUser } from "@/app/actions/register";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

const onFinish = async (values: any) => {
  setLoading(true);

  try {
    const result = await registerUser(values);

    console.log("RESULT:", result);

    if (result.error) {
      messageApi.error(result.error);
      return;
    }

    messageApi.success(result.success);

    const params = new URLSearchParams({
      email: result.email || values.email,
      type: "verify",
    });

    if (result.otp) {
      params.append("otp", result.otp);
    }

    setTimeout(() => {
      router.push(`/verify?${params.toString()}`);
    }, 1500);

  } catch (error) {
    console.error(error);
    messageApi.error("خطأ غير متوقع");
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthWrapper
      title="إنشاء حساب جديد"
      subtitle="انضم إلى منصة الإدارة الذكية"
      footerLink={{ text: "لديك حساب بالفعل؟", label: "دخول", href: "/login" }}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="الاسم الكامل"
          name="name"
          rules={[{ required: true, message: "يرجى إدخال الاسم الكامل" }]}
        >
          <Input placeholder="أدخل اسمك" disabled={loading} />
        </Form.Item>

        <Form.Item
          label="البريد الإلكتروني"
          name="email"
          rules={[
            { type: "email", message: "البريد الإلكتروني غير صحيح" },
            { required: true, message: "يرجى إدخال البريد الإلكتروني" },
          ]}
        >
          <Input placeholder="example@edu.com" disabled={loading} />
        </Form.Item>

        <Form.Item
          label="كلمة المرور"
          name="password"
          rules={[
            { required: true, message: "يرجى إدخال كلمة المرور" },
            { min: 6, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
          ]}
        >
          <Input.Password placeholder="********" disabled={loading} />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          إنشاء الحساب
        </Button>
      </Form>
    </AuthWrapper>
  );
}
