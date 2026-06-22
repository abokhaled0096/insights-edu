"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Space,
  Dropdown,
  Typography,
  Drawer,
  theme,
} from "antd";
import {
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useThemeStore } from "@/stores/use-theme";
import arEG from "antd/locale/ar_EG";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const { isDarkMode, toggle } = useThemeStore();
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Prevent hydration mismatch for persisted state
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const menuItems = [
    {
      key: `/${user.role.toLowerCase()}`,
      icon: <AppstoreOutlined />,
      label: "الرئيسية",
    },
    // Add specific items here
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: isDarkMode ? "#0f172a" : "#f8fafc",
      }}
    >
      {/* Floating Desktop Sider */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        width={260}
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          bottom: 16,
          borderRadius: 24,
          background: isDarkMode ? "#1e293b" : "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          zIndex: 100,
          border: "none",
        }}
        className="hidden lg:block"
      >
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <Title level={4} style={{ margin: 0, color: "#6366f1" }}>
            SMART
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{
            border: "none",
            background: "transparent",
            padding: "0 12px",
          }}
        />
      </Sider>

      <Layout
        style={{
          marginRight: 292, // Sider width (260) + margins
          background: "transparent",
          transition: "all 0.3s",
        }}
        className="responsive-layout"
      >
        <Header
          style={{
            margin: "16px 16px 0 0",
            borderRadius: 20,
            padding: "0 24px",
            background: isDarkMode ? "#1e293b" : "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            height: 70,
          }}
        >
          <Space size="middle">
            <Button
              className="lg:hidden"
              icon={<MenuOutlined />}
              type="text"
              onClick={() => setMobileVisible(true)}
            />
            <Text strong style={{ fontSize: 16 }}>
              لوحة التحكم
            </Text>
          </Space>

          <Space size="large">
            <Button
              type="text"
              shape="circle"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
            />
            <Button type="text" shape="circle" icon={<BellOutlined />} />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    label: "خروج",
                    danger: true,
                    icon: <LogoutOutlined />,
                    onClick: () => signOut(),
                  },
                ],
              }}
            >
              <Space style={{ cursor: "pointer" }}>
                <div
                  style={{ textAlign: "left", lineHeight: 1 }}
                  className="hidden sm:block"
                >
                  <Text strong style={{ display: "block" }}>
                    {user.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user.role}
                  </Text>
                </div>
                <Avatar
                  style={{ backgroundColor: "#6366f1" }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: "24px 16px", minHeight: 280 }}>
          {/* Minimalist Content Wrapper */}
          <div
            style={{
              background: isDarkMode ? "#1e293b" : "#ffffff",
              borderRadius: 24,
              padding: 32,
              minHeight: "80vh",
              boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>

      {/* Mobile Sidebar */}
      <Drawer
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: "32px 24px" }}>
          <Text strong style={{ fontSize: 20 }}>
            القائمة
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => {
            router.push(key);
            setMobileVisible(false);
          }}
          style={{ border: "none" }}
        />
      </Drawer>

      <style jsx global>{`
        @media (max-width: 991px) {
          .responsive-layout {
            margin-right: 16px !important;
          }
        }
        .ant-menu-item {
          border-radius: 12px !important;
          margin: 8px 0 !important;
        }
        .ant-menu-item-selected {
          background: #6366f1 !important;
          color: #ffffff !important;
        }
        .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }
      `}</style>
    </Layout>
  );
}
