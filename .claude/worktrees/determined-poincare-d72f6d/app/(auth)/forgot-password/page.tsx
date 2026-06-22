'use client';
import { Form, Input, Button } from 'antd';
import { AuthWrapper } from '@/components/auth/authWrapper';

export default function ForgotPassword() {
  return (
    <AuthWrapper 
      title="استعادة كلمة المرور" 
      subtitle="أدخل بريدك الإلكتروني لإرسال رابط الاستعادة"
      footerLink={{ text: "تذكرت كلمة المرور؟", label: "دخول", href: "/login" }}
    >
      <Form layout="vertical" size="large">
        <Form.Item name="email" rules={[{ type: 'email', required: true }]}>
          <Input placeholder="أدخل بريدك الإلكتروني" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>إرسال الرابط</Button>
      </Form>
    </AuthWrapper>
  );
}