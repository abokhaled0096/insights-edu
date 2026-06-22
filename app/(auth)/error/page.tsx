'use client';
import { Result, Button } from 'antd';
import { AuthWrapper } from '@/components/auth/authWrapper';
import Link from 'next/link';

export default function AuthError() {
  return (
    <AuthWrapper title="حدث خطأ!" subtitle="فشل التحقق من الهوية">
      <Result
        status="error"
        title="فشل الدخول"
        subTitle="يرجى التأكد من بياناتك أو المحاولة لاحقاً."
        extra={[
          <Button type="primary" key="console">
            <Link href="/login">العودة للدخول</Link>
          </Button>
        ]}
      />
    </AuthWrapper>
  );
}