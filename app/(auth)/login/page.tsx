"use client";
import { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { AuthWrapper } from "@/components/auth/authWrapper";
import Link from "next/link";
import { useThemeStore } from "@/stores/use-theme";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      // استخدام NextAuth للقيام بالمصادقة
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false, // نمنع التوجيه التلقائي للتحكم في الأخطاء برمجياً
      });

      if (result?.error) {
        // معالجة الأخطاء بناءً على نوع الخطأ العائد
        if (result.error === "CredentialsSignin") {
          messageApi.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else {
          messageApi.error("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً");
        }
      } else {
        messageApi.success("تم تسجيل الدخول بنجاح! جاري التحويل...");

        // التوجيه للوحة التحكم بعد نجاح الدخول
        setTimeout(() => {
          router.push("/");
          router.refresh(); // لتحديث حالة الجلسة في المكونات الأخرى
        }, 1000);
      }
    } catch (error) {
      messageApi.error("خطأ غير متوقع في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderRadius: 10,
    height: 46,
    fontSize: "0.9rem",
    background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.03)",
    border: isDarkMode
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(99,102,241,0.14)",
  };

  return (
    <>
      <style jsx global>{`
        /* Submit button shimmer */
        @keyframes btn-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>

      <AuthWrapper
        title="مرحباً بك مجدداً"
        subtitle="قم بتسجيل الدخول لمتابعة تحليلات طلابك"
        icon={<LoginOutlined />}
        footerLink={{
          text: "ليس لديك حساب؟",
          label: "ابدأ الآن مجاناً",
          href: "/register",
        }}
      >
        {contextHolder}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
          dir="rtl"
        >
          {/* Email */}
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              {
                required: true,
                type: "email",
                message: "يرجى إدخال بريد إلكتروني صحيح",
              },
            ]}
            style={{ marginBottom: 14 }}
          >
            <Input
              className="login-input"
              prefix={
                <MailOutlined style={{ color: "#6366f1", opacity: 0.7 }} />
              }
              placeholder="name@example.com"
              style={inputStyle}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
            style={{ marginBottom: 10 }}
          >
            <Input.Password
              className="login-input"
              prefix={
                <LockOutlined style={{ color: "#6366f1", opacity: 0.7 }} />
              }
              placeholder="••••••••"
              style={inputStyle}
            />
          </Form.Item>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6 mt-1">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="login-checkbox">
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: isDarkMode
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(15,15,40,0.45)",
                  }}
                >
                  تذكرني
                </span>
              </Checkbox>
            </Form.Item>

            <Link href="/forgot-password" className="forgot-link">
              نسيت كلمة المرور؟
            </Link>
          </div>

          {/* Submit */}
          <Form.Item noStyle>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="login-btn"
              icon={!loading && <ArrowLeftOutlined />}
              iconPlacement="end"
              style={{
                height: 50,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.02em",
              }}
            >
              دخول
            </Button>
          </Form.Item>
        </Form>
      </AuthWrapper>
    </>
  );
}
