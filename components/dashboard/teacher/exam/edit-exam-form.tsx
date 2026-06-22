"use client";

import {
  Form,
  Input,
  Button,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { updateExam } from "@/app/actions/teacher/exam/edit-exam";

type Props = {
  exam: {
    id: string;
    title: string;
    courseId: string;
  };
};

export default function EditExamForm({
  exam,
}: Props) {
  const [form] =
    Form.useForm();

  const router =
    useRouter();

  const [msgApi, contextHolder] =
    message.useMessage();

  async function onFinish(
    values: {
      title: string;
    }
  ) {
    try {
      await updateExam({
        examId: exam.id,
        title:
          values.title,
      });

      msgApi.success(
        "Exam updated successfully"
      );

      router.push(
        `/teacher/exams/${exam.id}`
      );

      router.refresh();
    } catch {
      msgApi.error(
        "Failed to update exam"
      );
    }
  }

  return (
    <>
      {contextHolder}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title:
            exam.title,
        }}
        onFinish={
          onFinish
        }
        className="max-w-xl"
      >
        <Form.Item
          label="Exam Title"
          name="title"
          rules={[
            {
              required: true,
              message:
                "Please enter exam title",
            },
          ]}
        >
          <Input
            size="large"
            placeholder="Enter exam title"
          />
        </Form.Item>

        <Form.Item
          label="Course ID"
        >
          <Input
            size="large"
            value={
              exam.courseId
            }
            disabled
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
        >
          Save Changes
        </Button>
      </Form>
    </>
  );
}