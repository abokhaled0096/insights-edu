'use client';

import { useState, useEffect, Suspense } from 'react';
import { Form, Button, message, Input, Typography } from 'antd';
import { SafetyCertificateOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AuthWrapper } from '@/components/auth/authWrapper';
import { useThemeStore } from '@/stores/use-theme';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP } from '@/app/actions/verify-otp';
import { resendOTP } from '@/app/actions/resend-otp';

const { Text } = Typography;

function VerifyPageInner() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useThemeStore();
  const [form] = Form.useForm();

  
  const type = searchParams.get('type') || 'verify'; 
  const email = searchParams.get('email') || 'your-email@example.com';
  const otpFromUrl = searchParams.get('otp');
  
  useEffect(() => {
     if (otpFromUrl) {
      // إظهار الرمز للمستخدم في تنبيه بسيط
      messageApi.info(`رمز التحقق الخاص بك هو: ${otpFromUrl}`, 10);
      
      // تعبئة الحقل تلقائياً إذا أردت تسهيل الأمر أكثر
      form.setFieldsValue({ otp: otpFromUrl });
    }
    }, [otpFromUrl, messageApi, form]);


  useEffect(() => {
   
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const onFinish = async (values: { otp: string }) => {
    setLoading(true);
    try {
      const result = await verifyOTP(email, values.otp);
      if (result.error) {
        messageApi.error(result.error);
        return;
      }
      messageApi.success("تم التحقق بنجاح!");
      if (type === 'reset') {
        router.push('/reset-password');
      } else {
        router.push('/login');
      }
    } catch (error) {
      messageApi.error("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const result = await resendOTP(email);
      if (result.error) {
        messageApi.error(result.error);
        return;
      }
      setCountdown(60);
      setCanResend(false);
      messageApi.success("تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني");
    } finally {
      setResendLoading(false);
    }
  };

  const inputStyle = {
    borderRadius: 12,
    height: 55,
    fontSize: "1.5rem",
    fontWeight: 'bold',
    textAlign: 'center' as const,
    background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.03)",
    border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(99,102,241,0.14)",
  };

  return (
    <AuthWrapper
      title={type === 'reset' ? "تأكيد الرمز" : "التحقق من الحساب"}
      subtitle={`أدخل الرمز المرسل إلى ${email}`}
      icon={<SafetyCertificateOutlined />}
      
    >
        {contextHolder}
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="otp"
          rules={[{ required: true, message: 'يرجى إدخال رمز التحقق' }, { len: 6, message: 'يجب أن يتكون الرمز من 6 أرقام' }]}
        >
          <Input.OTP 
            length={6} 
            size="large" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
            // @ts-ignore (لتمرير ستايل مخصص لكل خانة)
            variant="filled"
          />
        </Form.Item>

        <div className="text-center mb-6">
          {canResend ? (
            <Button 
              type="link" 
              onClick={handleResend} 
              loading={resendLoading}
              icon={<ReloadOutlined />}
              className="auth-footer-link"
            >
              إعادة إرسال الرمز
            </Button>
          ) : (
            <Text style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.85rem' }}>
              إعادة الإرسال خلال {countdown} ثانية
            </Text>
          )}
        </div>

        <Form.Item noStyle>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={!loading && <ArrowLeftOutlined />}
            style={{
              height: 50,
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            تحقق الآن
          </Button>
        </Form.Item>
      </Form>
    </AuthWrapper>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <VerifyPageInner />
    </Suspense>
  );
}