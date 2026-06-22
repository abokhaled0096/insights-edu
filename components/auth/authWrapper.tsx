'use client';
import React from 'react';
import { Card, Typography, theme as antTheme } from 'antd';
import Link from 'next/link';
import { useThemeStore } from '@/stores/use-theme';

const { Title, Text } = Typography;

interface AuthWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLink?: { text: string; href: string; label: string };
  icon?: React.ReactNode;
}

export const AuthWrapper = ({ title, subtitle, children, footerLink, icon }: AuthWrapperProps) => {
  const { isDarkMode } = useThemeStore();

  return (
    <>
      <style jsx global>{`
        @keyframes badge-pop {
          0%   { opacity: 0; transform: scale(0.7) translateY(-6px); }
          60%  { transform: scale(1.08) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes line-grow {
          from { width: 0; }
          to   { width: 2.5rem; }
        }

        .auth-wrapper-badge {
          animation: badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        }
        .auth-wrapper-line {
          animation: line-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }

        .auth-wrapper-card .ant-card-body {
          padding: 36px 36px 28px !important;
        }
        @media (max-width: 480px) {
          .auth-wrapper-card .ant-card-body {
            padding: 28px 20px 22px !important;
          }
        }

        .auth-footer-link {
          color: #6366f1 !important;
          font-weight: 600;
          position: relative;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 0; height: 1.5px;
          background: #6366f1;
          transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .auth-footer-link:hover::after { width: 100%; }
        .auth-footer-link:hover { color: #4f46e5 !important; }
      `}</style>

      <Card
        className="auth-wrapper-card"
        variant="outlined"
        style={{
          borderRadius: 20,
          background: isDarkMode
            ? 'rgba(15, 15, 25, 0.75)'
            : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isDarkMode
            ? '1px solid rgba(99, 102, 241, 0.18)'
            : '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: isDarkMode
            ? '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08)'
            : '0 24px 80px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-8">

          {/* Icon badge */}
          {icon && (
            <div
              className="auth-wrapper-badge mb-4 flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{
                background: isDarkMode
                  ? 'rgba(99,102,241,0.18)'
                  : 'rgba(99,102,241,0.1)',
                border: isDarkMode
                  ? '1px solid rgba(99,102,241,0.3)'
                  : '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.15)',
                color: '#6366f1',
                fontSize: 20,
              }}
            >
              {icon}
            </div>
          )}

          {/* Title */}
          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
              color: isDarkMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,15,40,0.9)',
              lineHeight: 1.25,
            }}
          >
            {title}
          </Title>

          {/* Accent line */}
          <div
            className="auth-wrapper-line mt-2.5 h-[2.5px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
          />

          {/* Subtitle */}
          <Text
            style={{
              display: 'block',
              marginTop: 10,
              fontSize: '0.875rem',
              color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(15,15,40,0.45)',
              letterSpacing: '0.01em',
            }}
          >
            {subtitle}
          </Text>
        </div>

        {/* ── Form content ── */}
        <div className="flex flex-col gap-0">
          {children}
        </div>

        {/* ── Divider ── */}
        {footerLink && (
          <div
            className="mt-7 pt-5 flex items-center justify-center gap-1.5 flex-wrap"
            style={{
              borderTop: isDarkMode
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(99,102,241,0.08)',
            }}
          >
            <Text
              style={{
                fontSize: '0.84rem',
                color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(15,15,40,0.42)',
              }}
            >
              {footerLink.text}
            </Text>
            <Link href={footerLink.href} className="auth-footer-link" style={{ fontSize: '0.84rem' }}>
              {footerLink.label}
            </Link>
          </div>
        )}
      </Card>
    </>
  );
};