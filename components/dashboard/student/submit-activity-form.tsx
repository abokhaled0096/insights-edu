"use client";

// components/dashboard/student/submit-activity-form.tsx

import { useActionState } from "react";

import {
  Card,
  Input,
  Button,
  Alert,
  Upload,
} from "antd";

import {
  Send,
} from "lucide-react";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

import { submitActivityAction } from "@/app/actions/student/submit-activity";

type Props = {
  activityId: string;
  attachmentUrl?: string | null;
};

type State = {
  success?: boolean;
  message?: string;
};

const initialState: State =
  {};

export default function SubmitActivityForm({
  activityId,
  attachmentUrl,
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
            title={
              state.message
            }
            showIcon
          />
        )}

        {attachmentUrl && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">مرفق من المعلم:</span>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              href={attachmentUrl} 
              target="_blank"
            >
              تحميل المرفق
            </Button>
          </div>
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
            ارفع ملف الإجابة (اختياري)
          </label>
          <div className="block">
            <Upload
              action="/api/upload"
              maxCount={1}
              name="file"
              onChange={(info) => {
                if (info.file.status === 'done' && info.file.response?.url) {
                  const input = document.querySelector('input[name="fileUrl"]') as HTMLInputElement;
                  if (input) input.value = info.file.response.url;
                } else if (info.file.status === 'removed') {
                  const input = document.querySelector('input[name="fileUrl"]') as HTMLInputElement;
                  if (input) input.value = "";
                }
              }}
            >
              <Button htmlType="button" icon={<UploadOutlined />}>رفع ملف (PDF, Word, PPT, ZIP)</Button>
            </Upload>
          </div>
          <input type="hidden" name="fileUrl" />
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