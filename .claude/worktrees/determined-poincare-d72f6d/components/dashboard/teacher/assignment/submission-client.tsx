/// app/teacher/assignments/[id]/submissions/client-page.tsx
"use client";

import {
  Card,
  Table,
  Tag,
  InputNumber,
  Button,
  Form,
  message,
  Typography,
} from "antd";

import {
  gradeAssignmentSubmission,
} from "@/app/actions/teacher/assignments/submission";

const { Title, Text } = Typography;

export default function ClientPage({
  assignment,
}: any) {
  async function submitGrade(
    submissionId: string,
    grade: number
  ) {
    const fd = new FormData();

    fd.append(
      "submissionId",
      submissionId
    );

    fd.append(
      "grade",
      String(grade)
    );

    try {
      await gradeAssignmentSubmission(
        fd
      );

      message.success(
        "Grade saved"
      );
    } catch {
      message.error(
        "Failed to save grade"
      );
    }
  }

  const columns = [
    {
      title: "Student",
      render: (_: any, row: any) =>
        row.student.name ||
        row.student.email,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color="blue">
          {status}
        </Tag>
      ),
    },
    {
      title: "Submitted At",
      render: (_: any, row: any) =>
        row.submittedAt
          ? new Date(
              row.submittedAt
            ).toLocaleString()
          : "-",
    },
    {
      title: "File",
      render: (_: any, row: any) =>
        row.fileUrl ? (
          <a
            href={row.fileUrl}
            target="_blank"
          >
            Open File
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Grade",
      render: (_: any, row: any) => (
        <Form
          layout="inline"
          onFinish={(values) =>
            submitGrade(
              row.id,
              values.grade
            )
          }
          initialValues={{
            grade:
              row.grade,
          }}
        >
          <Form.Item
            name="grade"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              size="small"
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>
          {
            assignment.title
          }
        </Title>

        <Text>
          Course:{" "}
          {
            assignment
              .course
              .name
          }
        </Text>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            assignment.submissions
          }
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>
    </div>
  );
}