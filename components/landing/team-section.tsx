"use client";

import React from "react";
import { Typography } from "antd";
import { useThemeStore } from "@/stores/use-theme";

const { Title, Text } = Typography;

const team = [
  { name: "منه الله أحمد البدوي الدمياطي", color: "#6366f1" },
  { name: "منار زغلول الصياد سواقي", color: "#10b981" },
  { name: "مريم عصام محمود البرمبالي", color: "#f59e0b" },
  { name: "مريم محمد حامد الخولي", color: "#8b5cf6" },
  { name: "منار عصام محمد فؤاد باشا", color: "#ec4899" },
  { name: "مريم هشام محمد إسماعيل", color: "#06b6d4" },
  { name: "مريم أحمد محمد البساطي", color: "#f97316" },
  { name: "مغفرة حسن علي العفيفي", color: "#14b8a6" },
  { name: "منة الله أيمن أحمد رزق", color: "#a855f7" },
  { name: "ملك أحمد محمود نصر", color: "#ef4444" },
];

export const TeamSection = () => {
  const { isDarkMode: d } = useThemeStore();

  return (
    <>
      <style jsx global>{`

        .team-wrapper {
          direction: rtl;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .floating-badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 24px;
          border-radius: 100px;
          background: ${d ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.8)"};
          border: 1px solid ${d ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"};
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: default;
          white-space: nowrap;
          width: fit-content;
        }

        .floating-badge:hover {
          transform: scale(1.08) rotate(-1deg);
          background: ${d ? "rgba(255, 255, 255, 0.12)" : "#ffffff"};
          border-color: var(--accent);
          box-shadow: 0 15px 30px -10px var(--accent-low);
          z-index: 10;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-left: 12px;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
        }

        .badge-text {
          font-weight: 700;
          font-size: 1rem;
          color: ${d ? "rgba(255,255,255,0.9)" : "#1e293b"};
        }

        /* Random float animation delays */
        .badge-0 { animation: float 5s ease-in-out infinite; }
        .badge-1 { animation: float 6s ease-in-out infinite 1s; }
        .badge-2 { animation: float 5.5s ease-in-out infinite 0.5s; }
        /* ... you can add more variations ... */
      `}</style>

      <section id="team" className="team-wrapper py-28 relative overflow-hidden">
        {/* Background Decorative Mesh */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          
          {/* Minimal Header */}
          <div className="mb-16">
            <Title level={2} style={{ 
              fontWeight: 900, 
              color: d ? "#fff" : "#0f172a",
              marginBottom: 8 
            }}>
              فريق العمل
            </Title>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full mb-4" />
            <Text style={{ color: d ? "rgba(255,255,255,0.5)" : "#64748b" }}>
                فريق مشروع تخرج كلية التربية النوعية قسم الحاسب الآلي · دُفعة 2026
            </Text>
          </div>

          {/* The Badge Cloud */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            {team.map((member, i) => (
              <div 
                key={i}
                className={`floating-badge badge-${i % 3}`}
                style={{ 
                  '--accent': member.color,
                  '--accent-low': `${member.color}40`
                } as React.CSSProperties}
              >
                <div className="dot" />
                <span className="badge-text">{member.name}</span>
              </div>
            ))}
          </div>

          {/* Modern Footer Divider */}
          <div className="mt-20 flex items-center justify-center gap-4 opacity-40">
            <div className="h-px flex-1 max-w-25 bg-linear-to-l from-transparent to-slate-500" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Graduation Project</span>
            <div className="h-px flex-1 max-w-25 bg-linear-to-r from-transparent to-slate-500" />
          </div>

        </div>
      </section>
    </>
  );
};