// src/app/page.tsx
"use client";

import { Layout, Button, Typography, Row, Col, Card, Tag, theme } from "antd";
import {
  ThunderboltOutlined,
  ScanOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  ArrowLeftOutlined,
  GithubOutlined,
  RobotOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { AppNavbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/footer";
import { useThemeStore } from "@/stores/use-theme";
import { TeamSection } from "@/components/landing/team-section";
import Link from "next/link";
import { useSession } from "next-auth/react";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const featureCards = [
  {
    icon: <ThunderboltOutlined />,
    title: "حضور ذكي عبر IoT",
    desc: "التحقق المزدوج باستخدام RFID مع ESP32-CAM لضمان تسجيل حضور دقيق وآمن.",
    accent: "#6366f1",
    tag: "IoT",
  },
  {
    icon: <ScanOutlined />,
    title: "تصحيح آلي للاختبارات",
    desc: "OCR + تحليل التظليل لاستخراج الإجابات والنتائج خلال ثوانٍ.",
    accent: "#f59e0b",
    tag: "OCR",
  },
  {
    icon: <RobotOutlined />,
    title: "تحليل ذكي بالذكاء الاصطناعي",
    desc: "استخدام Gemini API للتنبؤ بالأداء الدراسي وتحديد نقاط الضعف.",
    accent: "#10b981",
    tag: "AI",
  },
  {
    icon: <ExperimentOutlined />,
    title: "أنشطة وتكليفات",
    desc: "إدارة الكويزات والواجبات والأنشطة الطلابية من منصة واحدة.",
    accent: "#8b5cf6",
    tag: "LMS",
  },
];

const stats = [
  { num: "95%", label: "دقة التحقق بالحضور", icon: "✓" },
  { num: "70%", label: "توفير وقت التصحيح", icon: "⚡" },
  { num: "24/7", label: "متابعة مستمرة للطلاب", icon: "◎" },
  { num: "AI", label: "تحليل وتنبؤ ذكي", icon: "◈" },
];

const steps = [
  {
    num: "01",
    icon: <ThunderboltOutlined />,
    title: "الحضور الذكي",
    desc: "قراءة RFID ثم التقاط صورة والتحقق من هوية الطالب بشكل فوري.",
    accent: "#6366f1",
  },
  {
    num: "02",
    icon: <ScanOutlined />,
    title: "التصحيح الآلي",
    desc: "رفع الورقة وتحليلها بالكامل لاستخراج الإجابات والدرجة تلقائياً.",
    accent: "#f59e0b",
  },
  {
    num: "03",
    icon: <BarChartOutlined />,
    title: "التحليل الذكي",
    desc: "تحليل شامل للأداء والتنبؤ بالمخاطر الأكاديمية باستخدام AI.",
    accent: "#10b981",
  },
];

export default function InsightsEduLanding() {
  const { isDarkMode } = useThemeStore();
  const { token } = theme.useToken();
  const { data: session, status } = useSession();
  const d = isDarkMode;

  return (
    <>
      <style jsx global>{`
        /* Hero gradient text */
        .hero-gradient-text {
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #a78bfa 50%,
            #f59e0b 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Feature card hover */
        .feature-card {
          transition:
            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.25s !important;
        }
        .feature-card:hover {
          transform: translateY(-5px);
        }

        /* Stat card number */
        .stat-number {
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        /* Step connector line */
        .step-connector {
          position: absolute;
          top: 28px;
          left: -50%;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99, 102, 241, 0.3),
            transparent
          );
        }

        /* CTA section glow */
        .cta-glow {
          position: absolute;
          inset: -1px;
          border-radius: 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b);
          z-index: -1;
          filter: blur(18px);
          opacity: 0.5;
        }

        /* Pulse dot */
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .pulse-dot::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-ring 2s ease-out infinite;
        }

        /* Fade-in section */
        @keyframes section-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .section-animate {
          animation: section-fade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Tag pill */
        .feature-tag {
          font-size: 0.65rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.08em !important;
          border-radius: 6px !important;
          padding: 2px 7px !important;
        }

        /* Primary button */
        .hero-btn-primary {
          background: linear-gradient(135deg, #6366f1, #818cf8) !important;
          border: none !important;
          font-weight: 700 !important;
          transition:
            box-shadow 0.2s,
            transform 0.15s !important;
        }
        .hero-btn-primary:hover {
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4) !important;
          transform: translateY(-1px);
        }

        /* Ghost button */
        .hero-btn-ghost {
          font-weight: 700 !important;
          border-color: ${d
            ? "rgba(255,255,255,0.15)"
            : "rgba(99,102,241,0.25)"} !important;
          color: ${d ? "rgba(255,255,255,0.75)" : "#374151"} !important;
          background: ${d
            ? "rgba(255,255,255,0.05)"
            : "rgba(99,102,241,0.04)"} !important;
          transition:
            border-color 0.2s,
            background 0.2s,
            transform 0.15s !important;
        }
        .hero-btn-ghost:hover {
          border-color: #6366f1 !important;
          background: rgba(99, 102, 241, 0.1) !important;
          transform: translateY(-1px);
        }

        /* Noise bg */
        .noise-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>

      <Layout
        className="landing-root min-h-screen transition-all duration-300"
        style={{ background: token.colorBgLayout }}
      >
        <AppNavbar />

        <Content dir="rtl">
          {/* ════════════ HERO ════════════ */}
          <section className="relative px-4 sm:px-8 pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
            {/* Background orbs */}
            <div
              className={`absolute top-0 right-0 w-150 h-150 rounded-full pointer-events-none
              ${d ? "bg-indigo-600/10" : "bg-indigo-400/12"} blur-[120px]`}
            />
            <div
              className={`absolute bottom-0 left-0 w-125 h-125 rounded-full pointer-events-none
              ${d ? "bg-amber-500/8" : "bg-amber-400/10"} blur-[100px]`}
            />

            <div className="relative mx-auto max-w-5xl text-center section-animate">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-8">
                <div
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold
                  tracking-widest uppercase border
                  ${
                    d
                      ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
                      : "bg-indigo-50 border-indigo-200 text-indigo-600"
                  }`}
                >
                  <span
                    className="relative pulse-dot w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"
                    style={{ color: "#6366f1" }}
                  />
                  مشروع تخرج 2026
                </div>
              </div>

              {/* Headline */}
              <Title
                className="mb-6!"
                style={{
                  fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: d ? "rgba(255,255,255,0.93)" : "rgba(10,10,30,0.9)",
                }}
              >
                مستقبل التعليم يبدأ من{" "}
                <span className="hero-gradient-text">InsightsEdu</span>
              </Title>

              {/* Subtitle */}
              <Paragraph
                className="mx-auto mb-10! max-w-2xl"
                style={{
                  fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
                  lineHeight: 1.8,
                  color: d ? "rgba(255,255,255,0.45)" : "rgba(15,15,40,0.5)",
                }}
              >
                منصة تعليمية ذكية تجمع بين إنترنت الأشياء، التصحيح الآلي، تحليل
                أداء الطلاب، وإدارة الأنشطة والامتحانات في نظام واحد.
              </Paragraph>

              {/* CTA row */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  className="hero-btn-primary"
                  size="large"
                  style={{
                    height: 48,
                    borderRadius: 12,
                    paddingInline: 28,
                    fontSize: "0.95rem",
                  }}
                  icon={<ArrowLeftOutlined />}
                  iconPlacement="end"
                >
                  <Link
                    className="rtl"
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
                    ابدأ الآن
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* ════════════ FEATURES ════════════ */}
          <section id="features" className="px-4 sm:px-8 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              {/* Section header */}
              <div className="mb-14 text-center">
                <Text
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#6366f1",
                  }}
                >
                  المميزات الرئيسية
                </Text>
                <Title
                  level={2}
                  className="mt-2! mb-3!"
                  style={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: d ? "rgba(255,255,255,0.9)" : "rgba(10,10,30,0.88)",
                    fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  }}
                >
                  كل ما تحتاجه في منصة واحدة
                </Title>
                <Paragraph
                  style={{
                    color: d ? "rgba(255,255,255,0.4)" : "rgba(15,15,40,0.45)",
                    maxWidth: 480,
                    margin: "0 auto",
                    fontSize: "0.95rem",
                    lineHeight: 1.75,
                  }}
                >
                  أدوات ذكية تعمل معاً لتحسين تجربة التعليم وتوفير الوقت.
                </Paragraph>
              </div>

              <Row gutter={[20, 20]}>
                {featureCards.map((item, i) => (
                  <Col xs={24} sm={12} lg={6} key={i}>
                    <Card
                      className="feature-card h-full"
                      style={{
                        borderRadius: 18,
                        border: d
                          ? `1px solid ${item.accent}22`
                          : `1px solid ${item.accent}18`,
                        background: d
                          ? `linear-gradient(145deg, rgba(15,15,25,0.9), rgba(${hexToRgb(item.accent)},0.06))`
                          : `linear-gradient(145deg, #ffffff, ${item.accent}07)`,
                        boxShadow: d
                          ? `0 8px 32px rgba(0,0,0,0.25)`
                          : `0 4px 24px ${item.accent}12`,
                      }}
                      styles={{ body: { padding: "24px" } }}
                    >
                      {/* Icon + tag row */}
                      <div className="flex items-start justify-between mb-5">
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 13,
                            background: `${item.accent}18`,
                            border: `1px solid ${item.accent}30`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            color: item.accent,
                          }}
                        >
                          {item.icon}
                        </div>
                        <Tag
                          className="feature-tag"
                          style={{
                            background: `${item.accent}15`,
                            border: `1px solid ${item.accent}30`,
                            color: item.accent,
                            margin: 0,
                          }}
                        >
                          {item.tag}
                        </Tag>
                      </div>

                      <Title
                        level={5}
                        style={{
                          margin: "0 0 8px",
                          fontWeight: 700,
                          color: d
                            ? "rgba(255,255,255,0.88)"
                            : "rgba(10,10,30,0.85)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.title}
                      </Title>
                      <Text
                        style={{
                          fontSize: "0.83rem",
                          lineHeight: 1.7,
                          color: d
                            ? "rgba(255,255,255,0.38)"
                            : "rgba(15,15,40,0.45)",
                        }}
                      >
                        {item.desc}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* ════════════ HOW IT WORKS ════════════ */}
          <section
            id="workflow"
            className="px-4 sm:px-8 py-20 sm:py-24"
            style={{
              background: d
                ? "rgba(255,255,255,0.015)"
                : "rgba(99,102,241,0.025)",
            }}
          >
            <div className="mx-auto max-w-5xl">
              <div className="mb-14 text-center">
                <Text
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#6366f1",
                  }}
                >
                  آلية العمل
                </Text>
                <Title
                  level={2}
                  className="mt-2! mb-0!"
                  style={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: d ? "rgba(255,255,255,0.9)" : "rgba(10,10,30,0.88)",
                    fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  }}
                >
                  كيف يعمل النظام؟
                </Title>
              </div>

              <Row gutter={[24, 32]}>
                {steps.map((step, i) => (
                  <Col xs={24} md={8} key={i}>
                    <div className="flex flex-col items-center text-center gap-4 relative">
                      {/* Number */}
                      <div
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          color: step.accent,
                        }}
                      >
                        {step.num}
                      </div>

                      {/* Icon circle */}
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: `${step.accent}15`,
                          border: `2px solid ${step.accent}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          color: step.accent,
                          boxShadow: `0 8px 24px ${step.accent}20`,
                        }}
                      >
                        {step.icon}
                      </div>

                      <div>
                        <Title
                          level={5}
                          style={{
                            margin: "0 0 6px",
                            fontWeight: 700,
                            color: d
                              ? "rgba(255,255,255,0.88)"
                              : "rgba(10,10,30,0.85)",
                          }}
                        >
                          {step.title}
                        </Title>
                        <Text
                          style={{
                            fontSize: "0.83rem",
                            lineHeight: 1.7,
                            color: d
                              ? "rgba(255,255,255,0.38)"
                              : "rgba(15,15,40,0.45)",
                          }}
                        >
                          {step.desc}
                        </Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* ════════════ CTA ════════════ */}
          <section className="px-4 sm:px-8 py-20 sm:py-28">
            <div className="mx-auto max-w-4xl">
              <div className="relative">
                <div className="cta-glow" />
                <div
                  className="relative noise-bg overflow-hidden rounded-[28px] text-center px-6 py-16 sm:py-20"
                  style={{
                    background: d
                      ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)"
                      : "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)",
                  }}
                >
                  {/* Orb inside */}
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                  <div className="relative">
                    <Tag
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.9)",
                        borderRadius: 20,
                        marginBottom: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      ابدأ اليوم مجاناً
                    </Tag>

                    <Title
                      level={2}
                      className="mb-4!"
                      style={{
                        color: "#fff",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                      }}
                    >
                      جاهز لتطوير مؤسستك التعليمية؟
                    </Title>

                    <Paragraph
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                        maxWidth: 480,
                        margin: "0 auto 32px",
                        lineHeight: 1.8,
                      }}
                    >
                      استفد من قوة الذكاء الاصطناعي لتحسين أداء طلابك وتوفير
                      وقتك.
                    </Paragraph>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        size="large"
                        style={{
                          height: 48,
                          borderRadius: 12,
                          paddingInline: 28,
                          background: "#fff",
                          color: "#4f46e5",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                        }}
                        icon={<ArrowLeftOutlined />}
                        iconPlacement="end"
                      >
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
                          ابدأ مجاناً
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <TeamSection />
        </Content>

        <AppFooter isDarkMode={isDarkMode} />
      </Layout>
    </>
  );
}

// Helper: hex to "r,g,b" for rgba usage
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
