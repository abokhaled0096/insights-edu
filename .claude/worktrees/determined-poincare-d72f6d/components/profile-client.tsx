"use client";

// components/profile-page.tsx

import { useState } from "react";

import {
  Card,
  Avatar,
  Input,
  Button,
  Statistic,
  Row,
  Col,
  Tag,
  message,
} from "antd";

import {
  User,
  Image,
  Save,
} from "lucide-react";

import { format } from "date-fns";

import {
  updateProfileImageAction,
  updateProfileNameAction,
} from "@/app/actions/profile";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    studentCode: string | null;
    createdAt: string;
    updatedAt: string;

    stats: {
      enrollments: number;
      teachings: number;
      attendances: number;
    };
  } | null;
};

export default function ProfilePage({
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

  const saveName =
    async () => {
      setLoading(true);

      const res =
        await updateProfileNameAction(
          name
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

  const saveImage =
    async () => {
      setLoading(true);

      const res =
        await updateProfileImageAction(
          image
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {contextHolder}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          الملف الشخصي
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          معلومات الحساب
          وإدارته
        </p>
      </div>

      {/* Main */}
      <Card className="rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar
            size={96}
            src={
              user.image ||
              undefined
            }
            icon={
              <User
                size={34}
              />
            }
          />

          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="text-xl font-bold">
                {user.name ||
                  "بدون اسم"}
              </div>

              <div className="text-slate-500">
                {
                  user.email
                }
              </div>

              <Tag className="mt-2">
                {user.role}
              </Tag>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                size="large"
                placeholder="الاسم"
                value={
                  name
                }
                onChange={(
                  e
                ) =>
                  setName(
                    e.target
                      .value
                  )
                }
              />

              <Button
                type="primary"
                icon={
                  <Save
                    size={
                      16
                    }
                  />
                }
                loading={
                  loading
                }
                onClick={
                  saveName
                }
              >
                حفظ الاسم
              </Button>

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
                prefix={
                  <Image
                    size={
                      16
                    }
                  />
                }
              />

              <Button
                onClick={
                  saveImage
                }
                loading={
                  loading
                }
              >
                تحديث الصورة
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="الكورسات"
              value={
                user.stats
                  .enrollments +
                user.stats
                  .teachings
              }
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="الحضور"
              value={
                user.stats
                  .attendances
              }
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Student Code"
              value={
                user.studentCode ||
                "-"
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Dates */}
      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-2 text-sm text-slate-600">
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

          <div>
            آخر تحديث:
            {" "}
            {format(
              new Date(
                user.updatedAt
              ),
              "yyyy-MM-dd HH:mm"
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}