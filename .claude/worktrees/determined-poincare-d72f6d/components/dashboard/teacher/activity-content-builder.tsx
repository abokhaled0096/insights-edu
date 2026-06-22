"use client";

// components/dashboard/teacher/activity-content-builder.tsx

import { useActionState } from "react";

import {
  Card,
  Input,
  Select,
  Button,
  Alert,
  Tag,
  Empty,
  Divider,
} from "antd";

import {
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

import {
  addActivityContentAction,
  deleteActivityContentAction,
} from "@/app/actions/teacher/activity-content";

type Props = {
  activity: {
    id: string;
    title: string;
    type: string;
    course: {
      name: string;
      code: string;
    };

    contents: {
      id: string;
      title: string | null;
      body: string | null;
      type: string;
      sortOrder: number;
    }[];
  };
};

type State = {
  success?: boolean;
  message?: string;
};

const initialState: State = {};

export default function ActivityContentBuilder({
  activity,
}: Props) {
  const [
    state,
    action,
    pending,
  ] = useActionState(
    addActivityContentAction,
    initialState
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-sm border-0">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            محتوى النشاط
          </h1>

          <div className="text-slate-500">
            {
              activity.title
            }{" "}
            -{" "}
            {
              activity.course
                .name
            }
          </div>

          <Tag color="blue">
            {
              activity.type
            }
          </Tag>
        </div>
      </Card>

      {/* Add Content */}
      <Card className="rounded-2xl shadow-sm border-0">
        <h3 className="font-bold text-lg mb-4">
          إضافة عنصر جديد
        </h3>

        <form
          action={action}
          className="space-y-5"
        >
          <input
            type="hidden"
            name="activityId"
            value={
              activity.id
            }
          />

          {typeof state.success ===
            "boolean" && (
            <Alert
              type={
                state.success
                  ? "success"
                  : "error"
              }
              title={
                state.message
              }
              showIcon
            />
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <Input
              name="title"
              size="large"
              placeholder="عنوان المحتوى"
            />

            <Select
              size="large"
              placeholder="نوع المحتوى"
              options={[
                {
                  label:
                    "TEXT",
                  value:
                    "TEXT",
                },
                {
                  label:
                    "QUESTION",
                  value:
                    "QUESTION",
                },
                {
                  label:
                    "LINK",
                  value:
                    "LINK",
                },
                {
                  label:
                    "VIDEO",
                  value:
                    "VIDEO",
                },
                {
                  label:
                    "CODE",
                  value:
                    "CODE",
                },
                {
                  label:
                    "IMAGE",
                  value:
                    "IMAGE",
                },
                {
                  label:
                    "FILE",
                  value:
                    "FILE",
                },
              ]}
              onChange={(
                value
              ) => {
                const el =
                  document.querySelector(
                    'input[name="type"]'
                  ) as HTMLInputElement;

                el.value =
                  value;
              }}
            />
          </div>

          <input
            type="hidden"
            name="type"
          />

          <Input.TextArea
            rows={5}
            name="body"
            placeholder="المحتوى / رابط / كود / وصف السؤال"
          />

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            icon={
              <Plus
                size={16}
              />
            }
            loading={
              pending
            }
            className="w-full h-12 rounded-xl"
          >
            إضافة المحتوى
          </Button>
        </form>
      </Card>

      {/* Current Content */}
      <Card className="rounded-2xl shadow-sm border-0">
        <h3 className="font-bold text-lg mb-4">
          العناصر الحالية
        </h3>

        {activity.contents
          .length ===
        0 ? (
          <Empty description="لا يوجد محتوى بعد" />
        ) : (
          <div className="space-y-4">
            {activity.contents.map(
              (
                item,
                index
              ) => (
                <Card
                  key={
                    item.id
                  }
                  className="rounded-xl border"
                >
                  <div className="flex justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2 items-center">
                        <FileText
                          size={
                            16
                          }
                        />

                        <span className="font-semibold">
                          {index +
                            1}
                          .{" "}
                          {
                            item.title
                          }
                        </span>

                        <Tag color="blue">
                          {
                            item.type
                          }
                        </Tag>
                      </div>

                      <Divider className="my-2" />

                      <div className="text-slate-600 whitespace-pre-wrap">
                        {
                          item.body
                        }
                      </div>
                    </div>

                    <form
                      action={
                        deleteActivityContentAction
                      }
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={
                          item.id
                        }
                      />

                      <Button
                        htmlType="submit"
                        danger
                        icon={
                          <Trash2
                            size={
                              15
                            }
                          />
                        }
                      />
                    </form>
                  </div>
                </Card>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}