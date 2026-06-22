"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme, ThemeConfig } from "antd";
import arEG from "antd/locale/ar_EG";
import { useThemeStore } from "@/stores/use-theme";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeMode must be used within ThemeProvider");
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // استخدام الـ Store مباشرة كمصدر وحيد للحقيقة
  const { isDarkMode, toggle } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // لمنع مشاكل الـ Hydration في Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // تحديث كلاس الـ HTML ودعم Tailwind
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, [isDarkMode, mounted]);

  const themeConfig: ThemeConfig = useMemo(() => ({
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: `'Cairo', sans-serif`,
      colorPrimary: "#0F1E5A",
      colorInfo: "#0F1E5A",
      colorLink: "#F58A00",
      borderRadius: 14,
      
      // ألوان الخلفيات
      colorBgLayout: isDarkMode ? "#050814" : "#F0F4F8",
      colorBgContainer: isDarkMode ? "#111827" : "#FFFFFF",
      colorBgElevated: isDarkMode ? "#1A2338" : "#FFFFFF",
      
      // ألوان النصوص
      colorText: isDarkMode ? "#F8FAFC" : "#111827",
      colorTextSecondary: isDarkMode ? "#CBD5E1" : "#6B7280",
      
      // الحدود والظلال
      colorBorder: isDarkMode ? "#334155" : "#E5E7EB",
      boxShadow: isDarkMode 
        ? "0 8px 28px rgba(0,0,0,.45)" 
        : "0 8px 28px rgba(15,30,90,.08)",
    },
    components: {
      Button: {
        fontWeight: 700,
        borderRadius: 12,
        controlHeight: 42,
        primaryShadow: 
        isDarkMode
          ? "0 8px 20px rgba(255,255,255,.10)"
          : "0 4px 12px rgba(15,30,90,.50)",
      },
      Card: {
        borderRadiusLG: 20,
      },
      Layout: {
        headerBg: isDarkMode ? "#0B1026" : "#FFFFFF",
        siderBg: isDarkMode ? "#0F172A" : "#0F1E5A",
      },
      Menu: {
        
        colorText: isDarkMode ? "#F8FAFC" : "#111827",
        itemColor: isDarkMode ? "#F8FAFC" : "#111827",
        colorBgTextActive: "#F58A00",
        itemSelectedBg: isDarkMode ? "#F58A00" : "#0F1E5A",
        itemSelectedColor: "#FFFFFF",
      },
      Table: {
        headerBg: isDarkMode ? "#1E293B" : "#F8FAFC",
      },
      Sider: {
        colorBgContainer: isDarkMode   ? "rgba(8,8,14,0.92)"
              : "rgba(255,255,255,0.95)",
        background: isDarkMode   ? "rgba(8,8,14,0.92)"
              : "rgba(255,255,255,0.95)",
        colorBgElevated: isDarkMode ? "#0F172A" : "#0F1E5A",
      },
    }
  }), [isDarkMode]);

  // تجنب رندر السيرفر لمحتوى يعتمد على الـ Client Mode
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode,   toggleTheme: toggle }}>
      <ConfigProvider
        direction="rtl"
        locale={arEG}
        theme={themeConfig}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}