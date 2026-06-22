"use client";

import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  message,
} from "antd";

import {
  updateExam,
} from "@/app/actions/teacher/exam/edit-exam";

import QuestionsManager from "./questions-manager";

type Props = {
  exam: {
    id: string;
    title: string;
    courseId: string;
    questions: any[];
  };
};

export default function EditExamTabs({
  exam,
}: Props) {
  const [form] =
    Form.useForm();

  const [msg, holder] =
    message.useMessage();

  async function onFinish(
    values: {
      title: string;
    }
  ) {
    await updateExam({
      examId: exam.id,
      title:
        values.title,
    });

    msg.success(
      "Exam updated successfully"
    );
  }

  const items = [
    {
      key: "general",
      label:
        "Edit Exam",
      children: (
        <Card className="rounded-2xl shadow-sm">
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
                placeholder="Exam title"
              />
            </Form.Item>

            <Form.Item label="Course ID">
              <Input
                size="large"
                disabled
                value={
                  exam.courseId
                }
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
        </Card>
      ),
    },

    {
      key: "questions",
      label:
        "Questions",
      children: (
        <QuestionsManager
          examId={exam.id}
          questions={
            exam.questions
          }
        />
      ),
    },
  ];

  return (
    <>
      {holder}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Exam
        </h1>

        <p className="text-slate-500 mt-1">
          Manage exam
          information and
          questions
        </p>
      </div>

      <Tabs
        defaultActiveKey="general"
        items={items}
        size="large"
      />
    </>
  );
}