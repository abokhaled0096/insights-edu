"use client";

import { Button } from "antd";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/use-theme";

export default function ThemeToggle() {
  const { isDarkMode, toggle } = useThemeStore();

  return (
    <Button
      shape="circle"
      size="large"
      onClick={toggle}
      icon={
        isDarkMode ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )
      }
    />
  );
}