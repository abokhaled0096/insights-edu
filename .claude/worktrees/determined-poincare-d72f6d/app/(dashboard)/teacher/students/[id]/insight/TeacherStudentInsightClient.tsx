"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Statistic,
  Row,
  Col,
  Divider,
  List,
  message,
  Empty,
} from "antd";
import {
  RobotOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { generateStudentInsight } from "@/app/actions/student-insight-actions";

const { Title, Paragraph, Text } = Typography;

type Insight = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidence: number | null;
  summary: string;
  predictedOutcome: string | null;
  recommendations: any;
  reasons: any;
  attendanceRate: number | null;
  averageScore: number | null;
  assignmentRate: number | null;
  engagementScore: number | null;
  generatedAt: Date | string;
};

type Props = {
  student: {
    id: string;
    name: string | null;
    studentCode: string | null;
    email: string;
  };
  latestInsight: Insight | null;
};

export default function TeacherStudentInsightClient({
  student,
  latestInsight,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [insight, setInsight] = useState(latestInsight);

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateStudentInsight(student.id);

      if (!res.success) {
        message.error("Failed to generate report");
        return;
      }

      setInsight({
        ...res.data,
        generatedAt: new Date(),
      });

      message.success("AI report generated");
    });
  };

  const riskColor = {
    LOW: "green",
    MEDIUM: "orange",
    HIGH: "red",
  }[insight?.riskLevel || "LOW"];

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={2} className="mb-1!">
              Student Insight
            </Title>

            <Text strong>{student.name}</Text>
            <br />
            <Text type="secondary">
              Code: {student.studentCode || "N/A"}
            </Text>
            <br />
            <Text type="secondary">{student.email}</Text>
          </div>

          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={pending}
            onClick={handleGenerate}
          >
            Generate AI Report
          </Button>
        </div>
      </Card>

      {!insight && (
        <Card>
          <Empty
            description="No report generated yet"
          />
        </Card>
      )}

      {insight && (
        <>
          <Card>
            <div className="flex items-center justify-between">
              <Title level={4} className="mb-0!">
                Risk Assessment
              </Title>

              <Tag color={riskColor}>
                {insight.riskLevel}
              </Tag>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={6}>
                <Statistic
                  title="Confidence"
                  value={
                    insight.confidence
                      ? Math.round(
                          insight.confidence * 100
                        )
                      : 0
                  }
                  suffix="%"
                />
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Statistic
                  title="Average Score"
                  value={insight.averageScore || 0}
                />
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Statistic
                  title="Attendance"
                  value={insight.attendanceRate || 0}
                  suffix="%"
                />
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Statistic
                  title="Assignments"
                  value={insight.assignmentRate || 0}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>

          <Card>
            <Title level={4}>
              Predicted Outcome
            </Title>

            <Paragraph>
              {insight.predictedOutcome ||
                "No prediction"}
            </Paragraph>

            <Divider />

            <Title level={5}>Summary</Title>

            <Paragraph>
              {insight.summary}
            </Paragraph>
          </Card>

          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Title level={5}>Reasons</Title>

                <List
                  bordered
                  dataSource={
                    Array.isArray(insight.reasons)
                      ? insight.reasons
                      : []
                  }
                  renderItem={(item) => (
                    <List.Item>{item}</List.Item>
                  )}
                />
              </Col>

              <Col xs={24} lg={12}>
                <Title level={5}>
                  Recommendations
                </Title>

                <List
                  bordered
                  dataSource={
                    Array.isArray(
                      insight.recommendations
                    )
                      ? insight.recommendations
                      : []
                  }
                  renderItem={(item) => (
                    <List.Item>{item}</List.Item>
                  )}
                />
              </Col>
            </Row>
          </Card>

          <Card>
            <Button
              icon={<ReloadOutlined />}
              loading={pending}
              onClick={handleGenerate}
            >
              Regenerate Report
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}