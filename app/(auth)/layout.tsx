"use client";
import React from "react";
import { Layout, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/stores/use-theme";
import Logo from "@/components/layout/logo";
import ThemeToggle from "@/components/layout/theme-toggle";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  // Note: redirecting authenticated users away from auth pages is handled
  // centrally in proxy.ts (authorized callback). Doing it here too caused a
  // flashing redirect loop with /force-password-change, so it was removed.
  return (
    <Layout
      className={`
      relative min-h-screen overflow-hidden flex items-center justify-center
      auth-noise
      ${isDarkMode ? "bg-[#0a0a0f] auth-grid-dark" : "bg-[#f8f8fc] auth-grid"}
      `}
    >
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes orb-drift-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -30px) scale(1.08);
          }
        }
        @keyframes orb-drift-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 40px) scale(1.06);
          }
        }
        @keyframes orb-drift-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 20px) scale(1.04);
          }
        }

        .auth-orb-1 {
          animation: orb-drift-1 14s ease-in-out infinite;
        }
        .auth-orb-2 {
          animation: orb-drift-2 18s ease-in-out infinite;
        }
        .auth-orb-3 {
          animation: orb-drift-3 22s ease-in-out infinite;
        }

        .auth-card-wrapper {
          animation: fadeInUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Dot grid */
        .auth-grid {
          background-image: radial-gradient(
            circle,
            rgba(99, 102, 241, 0.18) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
        }
        .auth-grid-dark {
          background-image: radial-gradient(
            circle,
            rgba(99, 102, 241, 0.28) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
        }

        /* Noise overlay */
        .auth-noise::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .auth-home-label {
            display: none;
          }
        }

        /* Ant Design card inside auth */
        .auth-card-wrapper .ant-card {
          border: 1px solid
            ${isDarkMode ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)"};
          box-shadow: ${isDarkMode
            ? "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)"
            : "0 24px 80px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.06)"};
        }
      `}</style>
      {/* ── Ambient orbs ── */}
      <div
        className={`
            auth-orb-1 absolute rounded-full pointer-events-none
            w-[55vw] h-[55vw] max-w-160 max-h-160
            -top-1/4 -left-1/4
            ${
              isDarkMode
                ? "bg-indigo-600/20 blur-[120px]"
                : "bg-indigo-400/20 blur-[100px]"
            }
          `}
      />
      <div
        className={`
            auth-orb-2 absolute rounded-full pointer-events-none
            w-[45vw] h-[45vw] max-w-140 max-h-140
            -bottom-1/4 -right-1/4
            ${
              isDarkMode
                ? "bg-violet-600/20 blur-[120px]"
                : "bg-violet-400/20 blur-[100px]"
            }
          `}
      />
      <div
        className={`
            auth-orb-3 absolute rounded-full pointer-events-none
            w-[30vw] h-[30vw] max-w-90 max-h-90
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            ${
              isDarkMode
                ? "bg-sky-600/10 blur-[90px]"
                : "bg-sky-400/10 blur-[80px]"
            }
          `}
      />

      {/* ── Corner accent lines ── */}
      <div
        className={`
          absolute top-0 left-0 w-32 h-32 pointer-events-none
          border-t-2 border-l-2 rounded-br-none
          ${isDarkMode ? "border-indigo-500/30" : "border-indigo-400/25"}
        `}
      />
      <div
        className={`
          absolute bottom-0 right-0 w-32 h-32 pointer-events-none
          border-b-2 border-r-2
          ${isDarkMode ? "border-violet-500/30" : "border-violet-400/25"}
        `}
      />

      {/* ── Top-right controls ── */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        {/* Home button */}
        <Button
          onClick={() => router.push("/")}
          className={`
              flex flex-row-reverse items-center gap-2 px-3 h-9 rounded-xl
              text-sm font-semibold cursor-pointer border transition-all duration-200
              ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  : "bg-white/60 border-indigo-100 text-indigo-700 hover:bg-white/80"
              }
              backdrop-blur-md
            `}
        >
          <HomeOutlined className="text-sm" />
          <span className="auth-home-label">العودة للرئيسية</span>
        </Button>
        <ThemeToggle />

      </div>

     
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5">
        <Logo />
      </div>

      {/* ── Main content ── */}
      <div className="auth-card-wrapper relative z-10 w-full max-w-110 px-4 sm:px-6 py-6">
        {children}
      </div>

     
    </Layout>
  );
}
