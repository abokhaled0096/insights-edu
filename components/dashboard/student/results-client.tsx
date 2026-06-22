"use client";

import { Card, Table, Typography, Tag, Row, Col, Statistic, Progress } from "antd";
import { BookOutlined, TrophyOutlined, BarChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export type TranscriptCourse = {
  courseId: string;
  courseName: string;
  courseCode: string;
  quizzesTaken: number;
  averageScore: number;
  letterGrade: string;
  gpaPoints: number;
};

type Props = {
  courses: TranscriptCourse[];
  overallGpa: number;
  overallAverage: number;
};

export default function StudentTranscriptClient({ courses, overallGpa, overallAverage }: Props) {
  
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A": return "green";
      case "B+":
      case "B": return "blue";
      case "C+":
      case "C": return "orange";
      case "D+":
      case "D": return "warning";
      case "F": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "رمز المادة",
      dataIndex: "courseCode",
      key: "courseCode",
      render: (text: string) => <Text strong className="text-gray-500">{text}</Text>,
    },
    {
      title: "اسم المادة",
      dataIndex: "courseName",
      key: "courseName",
      render: (text: string) => <Text strong className="text-indigo-700">{text}</Text>,
    },
    {
      title: "الكويزات المنجزة",
      dataIndex: "quizzesTaken",
      key: "quizzesTaken",
      align: "center" as const,
    },
    {
      title: "متوسط الدرجات",
      dataIndex: "averageScore",
      key: "averageScore",
      align: "center" as const,
      render: (val: number, record: TranscriptCourse) => (
        record.quizzesTaken > 0 ? (
          <Progress 
            percent={val} 
            size="small" 
            status={val >= 50 ? "normal" : "exception"} 
            strokeColor={val >= 85 ? "#10b981" : val >= 65 ? "#3b82f6" : val >= 50 ? "#f59e0b" : "#ef4444"}
            format={(p) => `${p}%`}
          />
        ) : <Text type="secondary">—</Text>
      ),
    },
    {
      title: "التقدير",
      dataIndex: "letterGrade",
      key: "letterGrade",
      align: "center" as const,
      render: (grade: string) => (
        <Tag color={getGradeColor(grade)} className="text-sm font-bold w-12 text-center m-0">
          {grade}
        </Tag>
      ),
    },
    {
      title: "نقاط الـ GPA",
      dataIndex: "gpaPoints",
      key: "gpaPoints",
      align: "center" as const,
      render: (pts: number, record: TranscriptCourse) => record.quizzesTaken > 0 ? <Text strong>{pts.toFixed(2)}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <Title level={2} style={{ color: "white", margin: 0 }}>السجل الأكاديمي (Transcript)</Title>
          <Text className="text-indigo-100 mt-2 block opacity-90 text-lg">النتائج الشاملة والمعدل التراكمي في جميع المواد</Text>
        </div>
        <div className="hidden md:block">
          <TrophyOutlined style={{ fontSize: 64, opacity: 0.2 }} />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card variant="borderless" className="shadow-sm bg-indigo-50/50 rounded-2xl">
            <Statistic 
              title="إجمالي المواد المسجلة" 
              value={courses.length} 
              prefix={<BookOutlined className="text-indigo-500 mr-2" />} 
              styles={{ content: { color: "#3730a3", fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" className="shadow-sm bg-emerald-50/50 rounded-2xl">
            <Statistic 
              title="المعدل التراكمي (GPA)" 
              value={overallGpa.toFixed(2)} 
              suffix="/ 4.00"
              prefix={<BarChartOutlined className="text-emerald-500 mr-2" />} 
              styles={{ content: { color: overallGpa >= 3.0 ? "#10b981" : overallGpa >= 2.0 ? "#f59e0b" : "#ef4444", fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" className="shadow-sm bg-purple-50/50 rounded-2xl">
            <Statistic 
              title="المتوسط العام" 
              value={overallAverage.toFixed(1)} 
              suffix="%"
              prefix={<TrophyOutlined className="text-purple-500 mr-2" />} 
              styles={{ content: { color: "#7c3aed", fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-lg rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <Title level={4} className="m-0 text-gray-800">تفاصيل المواد</Title>
        </div>
        <Table 
          columns={columns} 
          dataSource={courses} 
          rowKey="courseId" 
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
}
