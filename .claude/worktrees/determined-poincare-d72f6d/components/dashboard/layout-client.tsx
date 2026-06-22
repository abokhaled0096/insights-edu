"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Layout,
  Menu,
  Drawer,
  Grid,
  Button,
  Badge,
  Space,
  theme,
  Avatar,
} from "antd";

import type { MenuProps } from "antd";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  AppstoreOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CheckOutlined,
} from "@ant-design/icons";

import Logo from "@/components/layout/logo";
import ThemeToggle from "@/components/layout/theme-toggle";
import SignOutModal from "@/components/dashboard/sign-out-modal";
import { useThemeStore } from "@/stores/use-theme";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];

type UserRole =
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "ADVISOR";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
};

export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const screens = useBreakpoint();

  const { isDarkMode } =
    useThemeStore();

  const { token } =
    theme.useToken();

  const [collapsed, setCollapsed] =
    useState(false);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const isMobile =
    screens.md === false;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const menuItems =
    useMemo<MenuItem[]>(() => {
      const common: MenuItem[] = [
        {
          key: "grp-settings",
          label: "النظام",
          type: "group",
          children: [
            {
              key: "/profile",
              icon: (
                <UserOutlined />
              ),
              label: (
                <Link href="/profile">
                  الملف الشخصي
                </Link>
              ),
            },
            {
              key: "/settings",
              icon: (
                <SettingOutlined />
              ),
              label: (
                <Link href="/settings">
                  الإعدادات
                </Link>
              ),
            },
            {
              key: "logout",
              icon: (
                <LogoutOutlined />
              ),
              label:
                <SignOutModal />,
              danger: true,
            },
          ],
        },
      ];

      if (
        user.role === "ADMIN"
      ) {
        return [
          {
            key: "grp-admin",
            label: "الإدارة",
            type: "group",
            children: [
              {
                key: "/admin",
                icon: (
                  <AppstoreOutlined />
                ),
                label: (
                  <Link href="/admin">
                    لوحة التحكم
                  </Link>
                ),
              },
              {
                key: "/admin/students",
                icon: (
                  <TeamOutlined />
                ),
                label: (
                  <Link href="/admin/students">
                    الطلاب
                  </Link>
                ),
              },
              {
                key: "/admin/teachers",
                icon: (
                  <UserOutlined />
                ),
                label: (
                  <Link href="/admin/teachers">
                    المدرسين
                  </Link>
                ),
              },
              {
                key: "/admin/courses",
                icon: (
                  <BookOutlined />
                ),
                label: (
                  <Link href="/admin/courses">
                    الكورسات
                  </Link>
                ),
              },
              {
                key: "/admin/reports",
                icon: (
                  <FileTextOutlined />
                ),
                label: (
                  <Link href="/admin/reports">
                    التقارير
                  </Link>
                ),
              },
            ],
          },
          ...common,
        ];
      }

      if (
        user.role ===
        "TEACHER"
      ) {
        return [
          {
            key: "grp-teacher",
            label: "المدرس",
            type: "group",
            children: [
              {
                key: "/teacher",
                icon: (
                  <AppstoreOutlined />
                ),
                label: (
                  <Link href="/teacher">
                    لوحة التحكم
                  </Link>
                ),
              },
              {
                key: "/teacher/courses",
                icon: (
                  <BookOutlined />
                ),
                label: (
                  <Link href="/teacher/courses">
                    كورساتي
                  </Link>
                ),
              },
              {
                key: "/teacher/students",
                icon: (
                  <TeamOutlined />
                ),
                label: (
                  <Link href="/teacher/students">
                    الطلاب
                  </Link>
                ),
              },
              {
                key: "/teacher/activities",
                icon: (
                  <FileTextOutlined />
                ),
                label: (
                  <Link href="/teacher/activities">
                    الأنشطة
                  </Link>
                ),
              },
              {
                key: "/teacher/assignments",
                icon: (
                  <CheckOutlined />
                ),
                label: (
                  <Link href="/teacher/assignments">
                    المهام
                  </Link>
                ),
              },
              {
                key: "/teacher/attendance",
                icon: (
                  <FileTextOutlined />
                ),
                label: (
                  <Link href="/teacher/attendance">
                    الحضور
                  </Link>
                ),
              },
              {
                key: "/teacher/exams",
                icon: (
                  <PaperClipOutlined />
                ),
                label: (
                  <Link href="/teacher/exams">
                    الامتحانات
                  </Link>
                ),
              },
            ],
          },
          ...common,
        ];
      }

      if (
        user.role ===
        "ADVISOR"
      ) {
        return [
          {
            key: "grp-advisor",
            label: "المرشد",
            type: "group",
            children: [
              {
                key: "/advisor",
                icon: (
                  <AppstoreOutlined />
                ),
                label: (
                  <Link href="/advisor">
                    لوحة التحكم
                  </Link>
                ),
              },
            ],
          },
          ...common,
        ];
      }

      return [
        {
          key: "grp-student",
          label: "الطالب",
          type: "group",
          children: [
            {
              key: "/student",
              icon: (
                <AppstoreOutlined />
              ),
              label: (
                <Link href="/student">
                  لوحة التحكم
                </Link>
              ),
            },
            {
              key: "/student/courses",
              icon: (
                <BookOutlined />
              ),
              label: (
                <Link href="/student/courses">
                  كورساتي
                </Link>
              ),
            },
            {
              key: "/student/attendance",
              icon: (
                <FileTextOutlined />
              ),
              label: (
                <Link href="/student/attendance">
                  الحضور
                </Link>
              ),
            },
            {
              key: "/student/results",
              icon: (
                <FileTextOutlined />
              ),
              label: (
                <Link href="/student/results">
                  النتائج
                </Link>
              ),
            },
          ],
        },
        ...common,
      ];
    }, [user.role]);

  const sidebarMenu = (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      defaultOpenKeys={[
        "grp-admin",
        "grp-teacher",
        "grp-student",
        "grp-advisor",
      ]}
      items={menuItems}
      style={{
        height: "100%",
        borderInlineEnd: 0,
        paddingTop: 8,
      }}
    />
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
      dir="rtl"
    >
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={
            collapsed
          }
          width={260}
          collapsedWidth={80}
          theme={
            isDarkMode
              ? "dark"
              : "light"
          }
          style={{
            overflow:
              "auto",
            height:
              "100vh",
            position:
              "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: 16,
              display:
                "flex",
              justifyContent:
                "center",
            }}
          >
            <Logo
              collapsed={
                collapsed
              }
            />
          </div>

          {sidebarMenu}
        </Sider>
      )}

      <Drawer
        placement="right"
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(
            false
          )
        }
        size={260}
        styles={{
          body: {
            padding: 0,
          },
        }}
        title={
          <Logo
            collapsed={
              false
            }
          />
        }
      >
        {sidebarMenu}
      </Drawer>

      <Layout
        style={{
          transition:
            "all .2s",
          marginInlineStart:
            isMobile
              ? 0
              : collapsed
              ? 80
              : 260,
        }}
      >
        <Header
          style={{
            position:
              "sticky",
            top: 0,
            zIndex: 99,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            paddingInline: 20,
            background:
              token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={
              isMobile
                ? (
                    <MenuUnfoldOutlined />
                  )
                : collapsed
                ? (
                    <MenuUnfoldOutlined />
                  )
                : (
                    <MenuFoldOutlined />
                  )
            }
            onClick={() =>
              isMobile
                ? setDrawerOpen(
                    true
                  )
                : setCollapsed(
                    !collapsed
                  )
            }
          />

          <Space>
            <ThemeToggle />

            <Badge count={5}>
              <Button
                type="text"
                shape="circle"
                icon={
                  <BellOutlined />
                }
              />
            </Badge>

            <Space>
              <Avatar
                src={
                  user.image ||
                  undefined
                }
                icon={
                  <UserOutlined />
                }
              />

              {!isMobile && (
                <div className="text-right leading-tight">
                  <div className="text-sm font-medium">
                    {user.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {user.role}
                  </div>
                </div>
              )}
            </Space>
          </Space>
        </Header>

        <Content
          style={{
            margin:
              "24px 16px",
            padding: 24,
            minHeight: 280,
            background:
              token.colorBgContainer,
            borderRadius:
              token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}