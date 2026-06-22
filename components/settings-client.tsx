"use client";

// components/settings-page.tsx

import { useState } from "react";

import {
  Card,
  Input,
  Button,
  Avatar,
  message,
  Tag,
} from "antd";

import {
  Save,
  KeyRound,
  User,
} from "lucide-react";

import { format } from "date-fns";

import {
  updateProfileAction,
  changePasswordAction,
} from "@/app/actions/settings";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    studentCode: string | null;
    createdAt: string;
  } | null;
};

export default function SettingsPage({
  user,
}: Props) {
  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [image, setImage] =
    useState(
      user?.image || ""
    );

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [msgApi, contextHolder] =
    message.useMessage();

  if (!user) {
    return (
      <div>
        غير مصرح
      </div>
    );
  }

  const saveProfile =
    async () => {
      setLoading(true);

      const form =
        new FormData();

      form.append(
        "name",
        name
      );

      form.append(
        "image",
        image
      );

      const res =
        await updateProfileAction(
          form
        );

      res.success
        ? msgApi.success(
            res.message
          )
        : msgApi.error(
            res.message
          );

      setLoading(false);
    };

  const changePassword =
    async () => {
      setLoading(true);

      const form =
        new FormData();

      form.append(
        "password",
        password
      );

      const res =
        await changePasswordAction(
          form
        );

      res.success
        ? msgApi.success(
            res.message
          )
        : msgApi.error(
            res.message
          );

      setPassword("");

      setLoading(false);
    };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {contextHolder}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          الإعدادات
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          إدارة الحساب
          والملف الشخصي
        </p>
      </div>

      {/* Profile */}
      <Card className="rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            size={72}
            src={
              user.image ||
              undefined
            }
            icon={
              <User
                size={28}
              />
            }
          />

          <div>
            <div className="text-lg font-semibold">
              {user.name}
            </div>

            <div className="text-slate-500 text-sm">
              {
                user.email
              }
            </div>

            <Tag className="mt-2">
              {user.role}
            </Tag>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            size="large"
            placeholder="الاسم"
            value={name}
            onChange={(
              e
            ) =>
              setName(
                e.target
                  .value
              )
            }
          />

          <Input
            size="large"
            placeholder="رابط الصورة"
            value={
              image
            }
            onChange={(
              e
            ) =>
              setImage(
                e.target
                  .value
              )
            }
          />
        </div>

        <Button
          type="primary"
          icon={
            <Save
              size={16}
            />
          }
          className="mt-4"
          loading={
            loading
          }
          onClick={
            saveProfile
          }
        >
          حفظ البيانات
        </Button>
      </Card>

      {/* Password */}
      <Card className="rounded-2xl shadow-sm">
        <h3 className="font-semibold mb-4">
          تغيير كلمة المرور
        </h3>

        <Input.Password
          size="large"
          placeholder="كلمة المرور الجديدة"
          value={
            password
          }
          onChange={(
            e
          ) =>
            setPassword(
              e.target
                .value
            )
          }
        />

        <Button
          type="primary"
          icon={
            <KeyRound
              size={16}
            />
          }
          className="mt-4"
          loading={
            loading
          }
          onClick={
            changePassword
          }
        >
          تحديث كلمة المرور
        </Button>
      </Card>

      {/* Info */}
      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-2 text-sm text-slate-600">
          <div>
            البريد:
            {" "}
            {
              user.email
            }
          </div>

          <div>
            Student Code:
            {" "}
            {user.studentCode ||
              "-"}
          </div>

          <div>
            تاريخ التسجيل:
            {" "}
            {format(
              new Date(
                user.createdAt
              ),
              "yyyy-MM-dd"
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}