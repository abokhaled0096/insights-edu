"use client";

import { useActionState } from "react";

import {
  Card,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Alert,
} from "antd";

import dayjs from "dayjs";

import { Save } from "lucide-react";

import {updateActivityAction, type ActionState,
} from "@/app/actions/teacher/update-activity";

type Props = {
  activity: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    points: number;
    dueDate: string | null;
    courseId: string;
  };

  courses: {
    id: string;
    name: string;
    code: string;
  }[];
};

const initialState: ActionState =
  {};

export default function EditActivityPage({
  activity,
  courses,
}: Props) {
  const [
    state,
    action,
    pending,
  ] = useActionState(
    updateActivityAction,
    initialState
  );

  return (
    <Card className="rounded-2xl shadow-sm border-0 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          تعديل النشاط
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          تحديث بيانات النشاط الحالي
        </p>
      </div>

      <form
        action={action}
        className="space-y-6"
      >
        {typeof state.success ===
          "boolean" && (
          <Alert
            showIcon
            type={
              state.success
                ? "success"
                : "error"
            }
            title={
              state.message
            }
          />
        )}

        <input
          type="hidden"
          name="id"
          defaultValue={
            activity.id
          }
        />

        <div className="space-y-2">
          <label>
            العنوان
          </label>

          <Input
            name="title"
            size="large"
            defaultValue={
              activity.title
            }
          />
        </div>

        <div className="space-y-2">
          <label>
            الوصف
          </label>

          <Input.TextArea
            name="description"
            rows={4}
            defaultValue={
              activity.description ||
              ""
            }
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label>
              النوع
            </label>

            <Select
              size="large"
              defaultValue={
                activity.type
              }
              options={[
                {
                  label:
                    "TASK",
                  value:
                    "TASK",
                },
                {
                  label:
                    "QUIZ",
                  value:
                    "QUIZ",
                },
                {
                  label:
                    "PROJECT",
                  value:
                    "PROJECT",
                },
                {
                  label:
                    "EXAM",
                  value:
                    "EXAM",
                },
                {
                  label:
                    "EVENT",
                  value:
                    "EVENT",
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

            <input
              type="hidden"
              name="type"
              defaultValue={
                activity.type
              }
            />
          </div>

          <div className="space-y-2">
            <label>
              الكورس
            </label>

            <Select
              size="large"
              defaultValue={
                activity.courseId
              }
              options={courses.map(
                (
                  c
                ) => ({
                  label: `${c.name} (${c.code})`,
                  value:
                    c.id,
                })
              )}
              onChange={(
                value
              ) => {
                const el =
                  document.querySelector(
                    'input[name="courseId"]'
                  ) as HTMLInputElement;

                el.value =
                  value;
              }}
            />

            <input
              type="hidden"
              name="courseId"
              defaultValue={
                activity.courseId
              }
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label>
              النقاط
            </label>

            <InputNumber
              className="w-full"
              size="large"
              min={0}
              defaultValue={
                activity.points
              }
              onChange={(
                value
              ) => {
                const el =
                  document.querySelector(
                    'input[name="points"]'
                  ) as HTMLInputElement;

                el.value =
                  String(
                    value ||
                      0
                  );
              }}
            />

            <input
              type="hidden"
              name="points"
              defaultValue={
                activity.points
              }
            />
          </div>

          <div className="space-y-2">
            <label>
              موعد التسليم
            </label>

            <DatePicker
              showTime
              size="large"
              className="w-full"
              defaultValue={
                activity.dueDate
                  ? dayjs(
                    activity.dueDate
                  )
                  : undefined
              }
              onChange={(
                date
              ) => {
                const el =
                  document.querySelector(
                    'input[name="dueDate"]'
                  ) as HTMLInputElement;

                el.value =
                  date
                    ? date.toISOString()
                    : "";
              }}
            />

            <input
              type="hidden"
              name="dueDate"
              defaultValue={
                activity.dueDate ||
                ""
              }
            />
          </div>
        </div>

        <Button
          htmlType="submit"
          type="primary"
          size="large"
          loading={
            pending
          }
          icon={
            <Save
              size={16}
            />
          }
          className="w-full h-12 rounded-xl"
        >
          حفظ التعديلات
        </Button>
      </form>
    </Card>
  );
}