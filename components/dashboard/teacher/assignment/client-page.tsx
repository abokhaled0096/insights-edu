/// app/teacher/assignments/AssignmentsClientPage.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Space,
  Popconfirm,
  message,
  Typography,
  Select,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/app/actions/teacher/assignments/assignments";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { TextArea } = Input;

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  attachmentUrl?: string | null;
  dueDate: string | Date;
  courseId: string;
  teacherId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Props = {
  initialAssignments: Assignment[];
  courses: { id: string; name: string; code: string }[];
};

export default function AssignmentsClientPage({
  initialAssignments,
  courses,
}: Props) {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);
  const [messageApi, contextHolder] = message.useMessage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const [pending, startTransition] = useTransition();
  const [form] = Form.useForm();
  const router = useRouter();

  const handleGoSubmissions = (id: string) => router.push(`/teacher/assignments/${id}/submissions`);
  function openCreateModal() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }

  function openEditModal(item: Assignment) {
    setEditing(item);

    form.setFieldsValue({
      title: item.title,
      description: item.description,
      attachmentUrl: item.attachmentUrl,
      dueDate: dayjs(item.dueDate),
    });

    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    form.resetFields();
    setEditing(null);
  }

  async function handleSubmit(values: any) {
    startTransition(async () => {
      try {
        if (editing) {
          const updated = await updateAssignment({
            id: editing.id,
            title: values.title,
            description: values.description,
            attachmentUrl: values.attachmentUrl,
            dueDate: values.dueDate.toDate(),
          });

          setAssignments((prev) =>
            prev.map((item) => (item.id === editing.id ? updated : item)),
          );

          messageApi.success("Assignment updated");
        } else {
          const created = await createAssignment({
            title: values.title,
            description: values.description,
            attachmentUrl: values.attachmentUrl,
            dueDate: values.dueDate.toDate(),
            courseId: values.courseId,
          });

          setAssignments((prev) => [created, ...prev]);

          messageApi.success("Assignment created");
        }

        closeModal();
      } catch {
        messageApi.error("Something went wrong");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAssignment(id);

        setAssignments((prev) => prev.filter((item) => item.id !== id));

        messageApi.success("Deleted successfully");
      } catch {
        messageApi.error("Delete failed");
      }
    });
  }

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (value: string) => value || "-",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (value: Date) => dayjs(value).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      render: (_: any, record: Assignment) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Edit</Button>
          <Button onClick={() => handleGoSubmissions(record.id)}>Submissions</Button>

          <Popconfirm
            title="Delete assignment?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >

        <Title level={3} style={{ margin: 0 }}>
          Assignments
        </Title>

        <Button type="primary" onClick={openCreateModal}>
          New Assignment
        </Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={assignments}
        columns={columns}
        loading={pending}
      />

      <Modal
        open={open}
        title={editing ? "Edit Assignment" : "Create Assignment"}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={pending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Attachment (PDF / DOC)">
            <Upload
              action="/api/upload"
              maxCount={1}
              name="file"
              onChange={(info) => {
                if (info.file.status === 'done' && info.file.response?.url) {
                  form.setFieldValue("attachmentUrl", info.file.response.url);
                  messageApi.success("تم رفع الملف بنجاح");
                } else if (info.file.status === 'error') {
                  messageApi.error("فشل رفع الملف");
                } else if (info.file.status === 'removed') {
                  form.setFieldValue("attachmentUrl", "");
                }
              }}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button htmlType="button" icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
            <Form.Item name="attachmentUrl" hidden>
              <Input />
            </Form.Item>
          </Form.Item>

          {!editing && (
            <Form.Item
              name="courseId"
              label="Course"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Course"
                options={courses.map((course) => ({
                  label: `${course.name} (${course.code})`,
                  value: course.id,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
