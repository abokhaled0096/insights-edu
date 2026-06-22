"use client";

import { Table, Button, Space } from "antd";
import Link from "next/link";

export default function ExamTable({ exams }: any) {
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Course",
      render: (_: any, row: any) => row.course.name,
    },
    {
      title: "Questions",
      render: (_: any, row: any) => row._count.questions,
    },
    {
      title: "Papers",
      render: (_: any, row: any) => row._count.papers,
    },
    {
      title: "Actions",
      render: (_: any, row: any) => (
        <Space>
          <Link href={`/teacher/exams/${row.id}/papers`}>
            <Button>عرض الأمتحان</Button>
          </Link>

          <Link href={`/teacher/exams/${row.id}/edit`}>
            <Button>تعديل</Button>
          </Link>

          <Link href={`/exams/${row.id}/paper`}>
            <Button type="primary">ورقة الامتحان</Button>
          </Link>
          <Link href={`/teacher/exams/${row.id}/grade`}>
            <Button type="primary">تصحيح الامتحان</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={exams} columns={columns} />;
}