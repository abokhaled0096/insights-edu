// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import DashboardLayoutClient from "@/components/dashboard/layout-client";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) 
    return redirect("/login");
  return (
    <DashboardLayoutClient
      user={
        {
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
          role: session?.user?.role
        }  
      }
    >
      {children}
    </DashboardLayoutClient>
  );
}