"use client";

import { useThemeStore } from "@/stores/use-theme";
import Link from "next/link";
import Image from "next/image";
export default function Logo({collapsed}: {collapsed?: boolean}) {
  const { isDarkMode } = useThemeStore();

  return (
    <Link href="/" className="logo-wrap flex items-center gap-2 no-underline">
      {/* Icon mark */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          overflow: "hidden",
        //   background: "linear-gradient(135deg, #6366f1, #818cf8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        //   boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          flexShrink: 0,
        }}
      >
       <Image src="/logo.png" alt="logo" width={100} height={100} />
      </div>

      {
        !collapsed && (
              <div style={{ lineHeight: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.03em",
              color: isDarkMode
                ? "rgba(255,255,255,0.92)"
                : "rgba(10,10,30,0.9)",
            }}
          >
            Insights
          </span>
          <span
            className="logo-text-accent"
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.03em",
            }}
          >
            Edu
          </span>
          <span className="logo-dot" />
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(10,10,30,0.35)",
            marginTop: 3,
          }}
        >
          Smart Education
        </p>
      </div>
        )
      }
    </Link>
  );
}
