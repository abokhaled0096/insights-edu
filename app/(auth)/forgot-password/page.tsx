'use client';
import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { AuthWrapper } from '@/components/auth/authWrapper';
import { resendOTP } from '@/app/actions/resend-otp';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const result = await resendOTP(values.email);
      if (result.error) {
        messageApi.error(result.error);
        return;
      }
      messageApi.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(values.email)}&type=reset`);
      }, 1200);
    } catch {
      messageApi.error('حدث خطأ، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني لإرسال رمز التحقق"
      footerLink={{ text: "تذكرت كلمة المرور؟", label: "دخول", href: "/login" }}
    >
      {contextHolder}
      <Form layout="vertical" size="large" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
            { type: 'email', message: 'البريد الإلكتروني غير صحيح' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#6366f1', opacity: 0.7 }} />}
            placeholder="أدخل بريدك الإلكتروني"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          إرسال رمز التحقق
        </Button>
      </Form>
    </AuthWrapper>
  );
}