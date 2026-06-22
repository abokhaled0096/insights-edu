"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layout, Button, Drawer, Menu, Switch, Typography, Space } from "antd";
import {
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/stores/use-theme";
import Logo from "./logo";
import { useSession } from "next-auth/react";
const { Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "features", label: "المميزات" },
  { key: "workflow", label: "آلية العمل" },
  { key: "team", label: "فريق المشروع" },
  { key: "contact", label: "اتصل بنا" },
];

export const AppNavbar = () => {
  const { isDarkMode, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Logo hover shimmer */
        @keyframes logo-shine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .logo-text-accent {
          background: linear-gradient(90deg, #6366f1, #a78bfa, #6366f1);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-wrap:hover .logo-text-accent {
          animation: logo-shine 1.2s linear infinite;
        }

        /* Nav link underline */
        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.01em;
          text-decoration: none;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 0;
          height: 1.5px;
          background: #6366f1;
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav-link:hover::after {
          width: 100%;
        }

        /* CTA button */
        .cta-btn {
          background: linear-gradient(135deg, #6366f1, #818cf8) !important;
          border: none !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
          transition:
            box-shadow 0.2s,
            transform 0.15s !important;
        }
        .cta-btn:hover {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
          transform: translateY(-1px);
        }
        .cta-btn:active {
          transform: translateY(0) !important;
        }

        /* Toggle pill */
        .theme-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.2s;
        }

        /* Drawer menu */
        .navbar-drawer .ant-drawer-header {
          border-bottom: none !important;
          padding: 20px 20px 12px !important;
        }
        .navbar-drawer .ant-drawer-body {
          padding: 0 !important;
        }
        .navbar-drawer .ant-menu-item {
          font-weight: 600 !important;
          font-size: 1rem !important;
          height: 52px !important;
          line-height: 52px !important;
          margin: 2px 8px !important;
          border-radius: 10px !important;
        }

        /* Dot badge on logo */
        .logo-dot {
          width: 6px;
          height: 6px;
          background: #6366f1;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 6px;
          margin-right: 1px;
        }
      `}</style>

      <Header
        dir="rtl"
        className="navbar-root sticky top-0 z-50 transition-all duration-300"
        style={{
          padding: "0 24px",
          height: 64,
          background: isDarkMode
            ? scrolled
              ? "rgba(8,8,14,0.92)"
              : "rgba(8,8,14,0.6)"
            : scrolled
              ? "rgba(255,255,255,0.94)"
              : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? isDarkMode
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(99,102,241,0.1)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? isDarkMode
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(99,102,241,0.08)"
            : "none",
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          {/* ── Logo ── */}
          <Logo />

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-7">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={`#${item.key}`}
                className="nav-link"
                style={{
                  color: isDarkMode
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(10,10,30,0.55)",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ── Desktop right ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <div onClick={toggle} className="theme-pill">
              {isDarkMode ? (
                <MoonOutlined style={{ fontSize: 13, color: "#a78bfa" }} />
              ) : (
                <SunOutlined style={{ fontSize: 13, color: "#f59e0b" }} />
              )}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: isDarkMode
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(10,10,30,0.45)",
                }}
              >
                {isDarkMode ? "ليلي" : "نهاري"}
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 22,
                background: isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
              }}
            />

            {/* CTA */}
            <Link
              href={
                status === "authenticated"
                  ? session.user.role === "ADMIN"
                    ? "/admin"
                    : session.user.role === "TEACHER" || session.user.role === "TA"
                      ? "/teacher"
                      : session.user.role === "ADVISOR"
                        ? "/advisor"
                        : "/student"
                  : "/login"
              }
            >
              <Button
                className="cta-btn"
                type="primary"
                size="middle"
                style={{ height: 38, borderRadius: 10, paddingInline: 18 }}
                icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
                iconPlacement="end"
              >
                دخول النظام
              </Button>
            </Link>
          </div>

          {/* ── Mobile right ── */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              onClick={toggle}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "none",
                background: isDarkMode
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(99,102,241,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDarkMode ? (
                <MoonOutlined style={{ color: "#a78bfa", fontSize: 14 }} />
              ) : (
                <SunOutlined style={{ color: "#f59e0b", fontSize: 14 }} />
              )}
            </Button>
            <Button
              onClick={() => setOpen(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "none",
                background: isDarkMode
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(99,102,241,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuOutlined
                style={{
                  color: isDarkMode
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(10,10,30,0.6)",
                  fontSize: 14,
                }}
              />
            </Button>
          </div>
        </div>
      </Header>

      {/* ── Mobile Drawer ── */}
      <Drawer
        className="navbar-drawer"
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        size={300}
        closeIcon={<CloseOutlined style={{ fontSize: 14 }} />}
        styles={{
          wrapper: { boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" },
          section: {
            background: isDarkMode ? "#09090f" : "#ffffff",
          },
        }}
        title={
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="10"
                  y="2"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.5"
                />
                <rect
                  x="2"
                  y="10"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.5"
                />
                <rect
                  x="10"
                  y="10"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: "1rem",
                letterSpacing: "-0.02em",
                color: isDarkMode
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(10,10,30,0.9)",
              }}
            >
              Insights<span style={{ color: "#6366f1" }}>Edu</span>
            </span>
          </div>
        }
      >
        <div className="flex flex-col h-full pb-6">
          {/* Nav items */}
          <div className="px-3 pt-2">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={`#${item.key}`}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 50,
                  padding: "0 14px",
                  borderRadius: 10,
                  margin: "2px 0",
                  color: isDarkMode
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(10,10,30,0.65)",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(99,102,241,0.07)";
                  e.currentTarget.style.color = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = isDarkMode
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(10,10,30,0.65)";
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="mt-auto px-4 space-y-3">
            {/* Divider */}
            <div
              style={{
                height: 1,
                background: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              }}
            />

            {/* Theme row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 12,
                background: isDarkMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(99,102,241,0.05)",
              }}
            >
              <Space size={8}>
                {isDarkMode ? (
                  <MoonOutlined style={{ color: "#a78bfa", fontSize: 14 }} />
                ) : (
                  <SunOutlined style={{ color: "#f59e0b", fontSize: 14 }} />
                )}
                <Text
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: isDarkMode
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(10,10,30,0.55)",
                  }}
                >
                  {isDarkMode ? "الوضع الليلي" : "الوضع النهاري"}
                </Text>
              </Space>
              <Switch
                checked={isDarkMode}
                onChange={toggle}
                size="small"
                style={{ background: isDarkMode ? "#6366f1" : undefined }}
              />
            </div>

            {/* CTA */}
            <Link
              href={
                status === "authenticated"
                  ? session.user.role === "ADMIN"
                    ? "/admin"
                    : session.user.role === "TEACHER" || session.user.role === "TA"
                      ? "/teacher"
                      : session.user.role === "ADVISOR"
                        ? "/advisor"
                        : "/student"
                  : "/login"
              }
              onClick={() => setOpen(false)}
            >
              <Button
                className="cta-btn"
                type="primary"
                block
                size="large"
                style={{ height: 46, borderRadius: 12, fontWeight: 700 }}
                icon={<ArrowLeftOutlined />}
                iconPlacement="end"
              >
                دخول النظام
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
};
