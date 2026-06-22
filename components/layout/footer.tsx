'use client';
import { Layout, Row, Col, Typography, Space, Divider, Button, Avatar } from 'antd';
import { GithubOutlined, TwitterOutlined, LinkedinOutlined, ProjectOutlined } from '@ant-design/icons';
import Logo from './logo';

const { Footer } = Layout;
const { Text, Title, Link } = Typography;

export const AppFooter = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <Footer style={{ 
      background: isDarkMode ? '#050505' : '#fdfdfd', 
      padding: '80px 5% 40px',
      borderTop: `1px solid ${isDarkMode ? '#222' : '#f0f0f0'}`
    }}>
      <Row gutter={[40, 40]} justify="space-between">
        <Col xs={24} md={8}>
          <Space orientation="vertical" size="middle">
            <Logo />
            <Text type="secondary" style={{ display: 'block', maxWidth: 300 }}>
              نظام ذكي متكامل يجمع بين عتاد IoT وتقنيات الذكاء الاصطناعي لتحليل أداء الطلاب وتطوير العملية التعليمية.
            </Text>
           
          </Space>
        </Col>

        <Col xs={12} md={4}>
          <Title level={5}>المنصة</Title>
          <Space orientation="vertical">
            <Link type="secondary">المميزات</Link>
            <Link type="secondary">آلية العمل</Link>
            <Link type="secondary">التحليلات</Link>
          </Space>
        </Col>

        <Col xs={12} md={4}>
          <Title level={5}>الدعم</Title>
          <Space orientation="vertical">
            <Link href='/#team' type="secondary">فريق المشروع</Link>
            <Link type="secondary">تواصل معنا</Link>
          </Space>
        </Col>

        <Col xs={24} md={6}>
          <Title level={5}>قسم الحاسب الآلي</Title>
          <Text type="secondary">
            كلية التربية النوعية<br />
            مشروع تخرج © 2026<br />
            جميع الحقوق محفوظة
          </Text>
        </Col>
      </Row>
      
      <Divider style={{ margin: '40px 0 20px' }} />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          صنع بكل حماس لدعم مستقبل التعليم الرقمي
        </Text>
      </div>
    </Footer>
  );
};