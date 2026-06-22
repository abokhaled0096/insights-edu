"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Upload,
  Button,
  Select,
  Typography,
  Alert,
  Divider,
  message,
  Spin,
} from "antd";
import { UploadOutlined, RobotOutlined, SaveOutlined } from "@ant-design/icons";

import {
  gradeExamPaperAction,
  saveExamGradeAction,
} from "@/app/actions/teacher/exam/grade";

const { Title, Paragraph, Text } = Typography;

type Student = {
  id: string;
  name: string | null;
  studentCode: string | null;
};

type Props = {
  examId: string;
  examTitle: string;
  totalMarks: number;
  students: Student[];
};

export default function TeacherExamGradeClient({
  examId,
  examTitle,
  totalMarks,
  students,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState<string>();
  const [result, setResult] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [pending, startTransition] = useTransition();

  const handleAnalyze = () => {
    if (!file) {
      messageApi.warning("Upload exam image first");
      return;
    }

    startTransition(async () => {
      const form = new FormData();
      form.append("image", file);
      form.append("examId", examId);

      const res = await gradeExamPaperAction(form);

      if (!res.success) {
        messageApi.error(res.error);
        return;
      }

      setResult(res.data);
      messageApi.success("AI analysis completed");
    });
  };

  const handleSave = () => {
    if (!studentId) {
      messageApi.warning("Select student first");
      return;
    }

    if (!result) {
      messageApi.warning("Analyze paper first");
      return;
    }

    startTransition(async () => {
      const res = await saveExamGradeAction({
        examId,
        studentId,
        score: result.score,
        aiResponse: result,
      });

      if (!res.success) {
        messageApi.error(res.error);
        return;
      }

      messageApi.success("Grade saved successfully");
    });
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      {contextHolder}
      <Title level={2}>Grade Exam</Title>

      <Card>
        <div className="space-y-3">
          <Text strong>{examTitle}</Text>
          <br />
          <Text>Total Marks: {totalMarks}</Text>

          <Divider />

          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Answer Sheet</Button>
          </Upload>

          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={pending}
            onClick={handleAnalyze}
          >
            Analyze With AI
          </Button>
        </div>
      </Card>

      {pending && (
        <Card>
          <Spin /> Processing...
        </Card>
      )}

      {result && (
        <Card>
          <Title level={4}>AI Result</Title>

          <Alert
            type="success"
            title={`Score: ${result.score} / ${result.total}`}
            showIcon
          />

          <Divider />

          <Paragraph>
            <strong>AI Feedback:</strong>
          </Paragraph>

          <Paragraph className="whitespace-pre-line">
            {result.feedback}
          </Paragraph>

          <Divider />

          <Select
            className="w-full"
            placeholder="Choose student"
            onChange={setStudentId}
            showSearch
            optionFilterProp="children"
          >
            {students.map((student) => (
              <Select.Option key={student.id} value={student.id}>
                {student.name} ({student.studentCode})
              </Select.Option>
            ))}
          </Select>

          <Button
            className="mt-4"
            type="primary"
            icon={<SaveOutlined />}
            loading={pending}
            onClick={handleSave}
          >
            Save Grade
          </Button>
        </Card>
      )}
    </div>
  );
}
