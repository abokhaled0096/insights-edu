'use client';
import { useState, Suspense } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthWrapper } from '@/components/auth/authWrapper';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/actions/settings';

function ResetPasswordInner() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const onFinish = async (values: { password: string; confirm: string }) => {
    setLoading(true);
    try {
      const result = await resetPassword(email, values.password);
      if (result?.error) {
        messageApi.error(result.error);
        return;
      }
      messageApi.success('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      messageApi.error('حدث خطأ، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="تعيين كلمة مرور جديدة"
      subtitle="أدخل كلمة المرور الجديدة"
      footerLink={{ text: "تذكرت كلمة المرور؟", label: "دخول", href: "/login" }}
    >
      {contextHolder}
      <Form layout="vertical" size="large" onFinish={onFinish}>
        <Form.Item
          name="password"
          label="كلمة المرور الجديدة"
          rules={[
            { required: true, message: 'يرجى إدخال كلمة المرور' },
            { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6366f1', opacity: 0.7 }} />}
            placeholder="••••••••"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="تأكيد كلمة المرور"
          dependencies={['password']}
          rules={[
            { required: true, message: 'يرجى تأكيد كلمة المرور' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('كلمتا المرور غير متطابقتين'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6366f1', opacity: 0.7 }} />}
            placeholder="••••••••"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          تغيير كلمة المرور
        </Button>
      </Form>
    </AuthWrapper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}