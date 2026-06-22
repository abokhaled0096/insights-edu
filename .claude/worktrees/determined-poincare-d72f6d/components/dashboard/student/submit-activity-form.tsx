"use client";

// components/dashboard/student/submit-activity-form.tsx

import { useActionState } from "react";

import {
  Card,
  Input,
  Button,
  Alert,
} from "antd";

import {
  Upload,
  Send,
} from "lucide-react";

import { submitActivityAction } from "@/app/actions/student/submit-activity";

type Props = {
  activityId: string;
};

type State = {
  success?: boolean;
  message?: string;
};

const initialState: State =
  {};

export default function SubmitActivityForm({
  activityId,
}: Props) {
  const [
    state,
    action,
    pending,
  ] = useActionState(
    submitActivityAction,
    initialState
  );

  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <h2 className="font-bold text-lg mb-5">
        تسليم النشاط
      </h2>

      <form
        action={action}
        className="space-y-5"
      >
        <input
          type="hidden"
          name="activityId"
          value={
            activityId
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
            message={
              state.message
            }
            showIcon
          />
        )}

        <div className="space-y-2">
          <label className="font-medium">
            الإجابة النصية
          </label>

          <Input.TextArea
            rows={6}
            name="textAnswer"
            placeholder="اكتب الحل أو الإجابة هنا..."
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">
            رابط الملف
          </label>

          <Input
            name="fileUrl"
            placeholder="مثال: /uploads/answer.pdf"
            prefix={
              <Upload
                size={16}
              />
            }
          />
        </div>

        <Button
          htmlType="submit"
          type="primary"
          size="large"
          icon={
            <Send
              size={16}
            />
          }
          loading={
            pending
          }
          className="w-full h-12 rounded-xl"
        >
          إرسال التسليم
        </Button>
      </form>
    </Card>
  );
}