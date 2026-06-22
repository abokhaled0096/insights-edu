"use client";

import { Card, Button, Table, Tag, Space, Typography, Divider, Row, Col } from 'antd';
import { 
  FilePdfOutlined, 
  ScanOutlined, 
  ArrowRightOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ExamDetailsClient({ exam }: { exam: any }) {
  
  // تعريف أعمدة جدول النتائج
  const columns = [
    {
      title: 'اسم الطالب',
      dataIndex: ['student', 'name'],
      key: 'studentName',
    },
    {
      title: 'كود الطالب',
      dataIndex: ['student', 'studentCode'],
      key: 'studentCode',
    },
    {
      title: 'الدرجة',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Tag color="blue" className="text-lg font-bold">{score}</Tag>,
    },
    {
      title: 'تاريخ التصحيح',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString('ar-EG'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <Space orientation="vertical" size={0}>
          <Title level={2} style={{ margin: 0 }}>{exam.title}</Title>
          <Text type="secondary">{exam.course.name} | {exam.course.code}</Text>
        </Space>
        
        <Space size="middle">
          <Button 
            icon={<FilePdfOutlined />} 
            size="large"
            href={`/api/exams/${exam.id}/print`}
            target="_blank"
          >
            تنزيل نماذج الـ QR
          </Button>
          
          <Link href={`/teacher/exams/${exam.id}/scan`}>
            <Button 
              type="primary" 
              icon={<ScanOutlined />} 
              size="large" 
              className="bg-green-600"
            >
              بدء التصحيح (OCR)
            </Button>
          </Link>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* عمود الأسئلة */}
        <Col xs={24} lg={16}>
          <Card title="هيكل الامتحان والأسئلة" extra={<Text type="secondary">{exam.questions.length} سؤال</Text>}>
            {exam.questions.map((q: any) => (
              <div key={q.id} className="mb-8 last:mb-0 border-b last:border-0 pb-4">
                <div className="flex justify-between mb-4">
                  <Text strong className="text-lg">س {q.order}: {q.text}</Text>
                  <Tag color="cyan">{q.marks} درجات</Tag>
                </div>
                
                <Row gutter={[16, 16]}>
                  {q.options.map((opt: any) => (
                    <Col span={12} key={opt.id}>
                      <div className={`p-3 rounded-md border ${q.correctAnswer === opt.label ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <Text strong className="mr-2">{opt.label}.</Text>
                        <Text>{opt.text}</Text>
                        {q.correctAnswer === opt.label && <CheckCircleOutlined className="float-left text-green-500 mt-1" />}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Card>
        </Col>

        {/* عمود الإحصائيات والنتائج */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <Card title="ملخص التصحيح">
              <div className="flex justify-around text-center">
                <div>
                  <Title level={3} style={{ margin: 0 }}>{exam.results.length}</Title>
                  <Text type="secondary">تم تصحيحهم</Text>
                </div>
                <Divider type="vertical" style={{ height: '50px' }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>{exam.questions.reduce((acc: number, curr: any) => acc + curr.marks, 0)}</Title>
                  <Text type="secondary">الدرجة الكلية</Text>
                </div>
              </div>
            </Card>

            <Card title="النتائج الأخيرة">
              <Table 
                dataSource={exam.results} 
                columns={columns} 
                rowKey="id" 
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}