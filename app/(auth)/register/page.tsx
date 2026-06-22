"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Result, Button, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { AuthWrapper } from "@/components/auth/authWrapper";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => router.replace("/login"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AuthWrapper
      title="التسجيل مغلق"
      subtitle="يتم إنشاء الحسابات من قبل إدارة النظام فقط"
      icon={<LockOutlined />}
      footerLink={{ text: "لديك حساب بالفعل؟", label: "دخول", href: "/login" }}
    >
      <Result
        status="403"
        title="التسجيل العام مغلق"
        subTitle="لا يمكن إنشاء حساب ذاتياً. يرجى التواصل مع مسؤول النظام (Admin) لإنشاء حسابك."
        extra={
          <Link href="/login">
            <Button type="primary" size="large">
              الذهاب لتسجيل الدخول
            </Button>
          </Link>
        }
      />
    </AuthWrapper>
  );
}
