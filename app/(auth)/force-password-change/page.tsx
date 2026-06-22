"use client";

import { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { AuthWrapper } from "@/components/auth/authWrapper";
import { forceChangePassword } from "@/app/actions/force-change-password";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const { Text } = Typography;

export default function ForcePasswordChangePage() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const { data: session, update } = useSession();

  const onFinish = async (values: { password: string; confirm: string }) => {
    setLoading(true);
    try {
      const result = await forceChangePassword(values.password);
      if (result.error) {
        messageApi.error(result.error);
        return;
      }
      messageApi.success("تم تغيير كلمة المرور بنجاح! جاري التحويل...");
      
      await signIn("credentials", {
        email: session?.user?.email,
        password: values.password,
        redirect: false,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch {
      messageApi.error("حدث خطأ، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="تغيير كلمة المرور مطلوب"
      subtitle="يجب تعيين كلمة مرور جديدة قبل الدخول للنظام"
      icon={<SafetyCertificateOutlined />}
    >
      {contextHolder}
      <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(245,130,32,0.08)", border: "1px solid rgba(245,130,32,0.2)" }}>
        <Text style={{ fontSize: "0.85rem", color: "#F58220" }}>
          تم إنشاء حسابك بواسطة مسؤول النظام بكلمة مرور مؤقتة. يرجى تعيين كلمة مرور قوية خاصة بك للمتابعة.
        </Text>
      </div>
      <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="password"
          label="كلمة المرور الجديدة"
          rules={[
            { required: true, message: "يرجى إدخال كلمة المرور" },
            { min: 8, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "يجب أن تحتوي على حرف كبير وصغير ورقم على الأقل",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#6366f1", opacity: 0.7 }} />}
            placeholder="كلمة مرور قوية (8+ أحرف)"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="تأكيد كلمة المرور"
          dependencies={["password"]}
          rules={[
            { required: true, message: "يرجى تأكيد كلمة المرور" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("كلمتا المرور غير متطابقتين"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#6366f1", opacity: 0.7 }} />}
            placeholder="أعد إدخال كلمة المرور"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 50, borderRadius: 12, fontWeight: 700 }}>
          تعيين كلمة المرور والدخول
        </Button>
      </Form>
    </AuthWrapper>
  );
}
