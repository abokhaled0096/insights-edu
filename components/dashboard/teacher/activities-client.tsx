"use client";

import { useActionState } from "react";

import {
  Input,
  Select,
  Button,
  InputNumber,
  DatePicker,
  Alert,
  Card,
  Divider,
  Upload,
  message,
} from "antd";

import { Plus } from "lucide-react";
import { UploadOutlined } from "@ant-design/icons";

import { createCourseActivityAction } from "@/app/actions/teacher/create-activity";

type Props = {
  courses: {
    id: string;
    name: string;
    code: string;
  }[];

  activities: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    points: number;
    dueDate: string | null;
    createdAt: string;

    course: {
      id: string;
      name: string;
      code: string;
      students: number;
    };
  }[];

  stats: {
    total: number;
    tasks: number;
    quizzes: number;
    projects: number;
    exams: number;
    events: number;
  };
};

type State = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};



const initialState: State = {};

export default function CreateActivityForm({ courses }: Props) {
  const [state, action, pending] = useActionState(
    createCourseActivityAction,
    initialState,
  );
  
  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">إنشاء نشاط جديد</h2>

        <p className="text-sm text-slate-500 mt-1">
          أضف نشاطًا جديدًا للطلاب داخل الكورس
        </p>
      </div>

      <Divider className="my-4" />

      <form action={action} className="space-y-6">
        {typeof state.success === "boolean" && (
          <Alert
            type={state.success ? "success" : "error"}
            title={
              state.success
                ? "تم إنشاء النشاط بنجاح"
                : state.message || "فشل إنشاء النشاط"
            }
            showIcon
            className="rounded-xl"
          />
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            عنوان النشاط
          </label>

          <Input
            name="title"
            size="large"
            placeholder="مثال: Quiz Chapter 1"
            className="rounded-xl"
            status={state.errors?.title ? "error" : undefined}
          />
          {state.errors?.title && (
            <p className="text-xs text-red-500 m-0">{state.errors.title[0]}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الوصف</label>

          <Input.TextArea
            name="description"
            rows={4}
            placeholder="اكتب وصف النشاط..."
            className="rounded-xl"
          />
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ملف المرفقات (اختياري)
          </label>
          <div className="block">
            <Upload
              action="/api/upload"
              maxCount={1}
              name="file"
              onChange={(info) => {
                if (info.file.status === 'done' && info.file.response?.url) {
                  const input = document.querySelector('input[name="attachmentUrl"]') as HTMLInputElement;
                  if (input) input.value = info.file.response.url;
                  message.success("تم رفع الملف بنجاح");
                } else if (info.file.status === 'error') {
                  message.error("فشل رفع الملف");
                } else if (info.file.status === 'removed') {
                  const input = document.querySelector('input[name="attachmentUrl"]') as HTMLInputElement;
                  if (input) input.value = "";
                }
              }}
            >
              <Button htmlType="button" icon={<UploadOutlined />}>رفع ملف (PDF, DOCX, ZIP)</Button>
            </Upload>
          </div>
          <input type="hidden" name="attachmentUrl" />
        </div>

        {/* Type + Course */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              نوع النشاط
            </label>

            <Select
              size="large"
              className="w-full"
              placeholder="اختر النوع"
              status={state.errors?.type ? "error" : undefined}
              options={[
                {
                  label: "TASK",
                  value: "TASK",
                },
                {
                  label: "QUIZ",
                  value: "QUIZ",
                },
                {
                  label: "PROJECT",
                  value: "PROJECT",
                },
                {
                  label: "EXAM",
                  value: "EXAM",
                },
                {
                  label: "EVENT",
                  value: "EVENT",
                },
              ]}
              onChange={(value) => {
                const input = document.querySelector(
                  'input[name="type"]',
                ) as HTMLInputElement;

                if (input) input.value = value;
              }}
            />
            {state.errors?.type && (
              <p className="text-xs text-red-500 m-0">{state.errors.type[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">الكورس</label>

            <Select
              size="large"
              className="w-full"
              placeholder="اختر الكورس"
              status={state.errors?.courseId ? "error" : undefined}
              options={courses.map((c) => ({
                label: `${c.name} (${c.code})`,
                value: c.id,
              }))}
              onChange={(value) => {
                const input = document.querySelector(
                  'input[name="courseId"]',
                ) as HTMLInputElement;

                if (input) input.value = value;
              }}
            />
            {state.errors?.courseId && (
              <p className="text-xs text-red-500 m-0">{state.errors.courseId[0]}</p>
            )}
          </div>
        </div>

        <input type="hidden" name="type" />

        <input type="hidden" name="courseId" />

        {/* Points + DueDate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">النقاط</label>

            <InputNumber
              min={0}
              className="w-full"
              size="large"
              placeholder="0"
              onChange={(value) => {
                const input = document.querySelector(
                  'input[name="points"]',
                ) as HTMLInputElement;

                if (input) input.value = String(value || 0);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              موعد التسليم
            </label>

            <DatePicker
              showTime
              size="large"
              className="w-full"
              placeholder="اختر التاريخ"
              onChange={(date) => {
                const input = document.querySelector(
                  'input[name="dueDate"]',
                ) as HTMLInputElement;

                if (input) input.value = date ? date.toISOString() : "";
              }}
            />
          </div>
        </div>

        <input type="hidden" name="points" />

        <input type="hidden" name="dueDate" />

        {/* Submit */}
        <div className="pt-3">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={pending}
            icon={<Plus size={16} />}
            className="w-full h-12 rounded-xl font-semibold"
          >
            إضافة النشاط
          </Button>
        </div>
      </form>
    </Card>
  );
}
