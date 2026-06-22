'use client';

import Link from 'next/link';
import { Result, Button, theme } from 'antd';

export default function NotFound() {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        maxHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        background: token.colorBgLayout,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
        
          padding: '24px',
        }}
      >
        <Result
          status="404"
          title={
            <span style={{ color: token.colorTextHeading }}>
              404
            </span>
          }
          subTitle={
            <span style={{ color: token.colorTextSecondary }}>
              عذرًا، الصفحة التي تبحث عنها غير موجودة.
            </span>
          }
          extra={
            <Link href="/">
              <Button type="primary" size="large">
                العودة إلى الرئيسية
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}