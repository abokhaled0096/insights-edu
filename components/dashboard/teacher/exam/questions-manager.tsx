"use client";

import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  message,
} from "antd";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  addQuestion,
  deleteQuestion,
} from "@/app/actions/teacher/exam/question";

export default function QuestionsManager({
  examId,
  questions,
}: any) {
  const [open, setOpen] =
    useState(false);

  const [form] =
    Form.useForm();

  const router =
    useRouter();

  const [msg, holder] =
    message.useMessage();

  async function onFinish(
    values: any
  ) {
    await addQuestion({
      examId,
      ...values,
    });

    msg.success(
      "Added successfully"
    );

    form.resetFields();
    setOpen(false);

    router.refresh();
  }

  async function remove(
    id: string
  ) {
    await deleteQuestion(
      id,
      examId
    );

    msg.success(
      "Deleted"
    );

    router.refresh();
  }

  return (
    <>
      {holder}

      <Card>
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">
            Questions
          </h2>

          <Button
            type="primary"
            onClick={() =>
              setOpen(true)
            }
          >
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {questions.length ===
          0 ? (
            <div>
              No Questions
            </div>
          ) : (
            questions.map(
              (
                q: any
              ) => (
                <Card
                  key={q.id}
                  size="small"
                >
                  <div className="font-semibold mb-2">
                    Q{q.order}.{" "}
                    {q.text}
                  </div>

                  <div className="mb-2 space-x-2">
                    <Tag>
                      {
                        q.type
                      }
                    </Tag>

                    <Tag color="green">
                      {
                        q.marks
                      }{" "}
                      Marks
                    </Tag>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {q.options.map(
                      (
                        op: any
                      ) => (
                        <div
                          key={
                            op.id
                          }
                        >
                          {
                            op.label
                          }
                          .{" "}
                          {
                            op.text
                          }
                        </div>
                      )
                    )}
                  </div>

                  <Button
                    danger
                    onClick={() =>
                      remove(
                        q.id
                      )
                    }
                  >
                    Delete
                  </Button>
                </Card>
              )
            )
          )}
        </div>
      </Card>

      <Modal
        open={open}
        footer={null}
        onCancel={() =>
          setOpen(false)
        }
        title="Add Question"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={
            onFinish
          }
        >
          <Form.Item
            name="text"
            label="Question"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            initialValue="MCQ"
            label="Type"
          >
            <Select
              options={[
                {
                  label:
                    "MCQ",
                  value:
                    "MCQ",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="marks"
            initialValue={1}
            label="Marks"
          >
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item
            name="correctAnswer"
            label="Correct Answer"
          >
            <Select
              options={[
                {
                  value:
                    "A",
                },
                {
                  value:
                    "B",
                },
                {
                  value:
                    "C",
                },
                {
                  value:
                    "D",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="optionA"
            label="Option A"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionB"
            label="Option B"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionC"
            label="Option C"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionD"
            label="Option D"
          >
            <Input />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            block
          >
            Save
          </Button>
        </Form>
      </Modal>
    </>
  );
}