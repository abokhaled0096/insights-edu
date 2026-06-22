import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/theme";
import NextAuthProvider from "@/components/providers/session";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: "InsightsEdu - منصة الإدارة الذكية للتعليم",
  description: "نظام ذكي متكامل يجمع بين عتاد IoT وتقنيات الذكاء الاصطناعي لتحليل أداء الطلاب وتطوير العملية التعليمية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.className} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextAuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
