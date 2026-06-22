// app/(dashboard)/layout.tsx

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import DashboardLayoutClient from "@/components/dashboard/layout-client";
import { redirect } from "next/navigation";

import ChatbotWidget from "@/components/dashboard/student/chatbot-widget";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/login");

  // Force password change for newly provisioned accounts
  if (session.user?.requirePasswordChange === true) {
    return redirect("/force-password-change");
  }

  return (
    <DashboardLayoutClient
      user={{
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
        role: session.user?.role,
      }}
    >
      {children}
      {session.user?.role === "STUDENT" && <ChatbotWidget />}
    </DashboardLayoutClient>
  );
}