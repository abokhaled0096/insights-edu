"use client";

import { Form, Input, Button, Select } from "antd";
import { createExam } from "@/app/actions/teacher/exam/exam-actions";

type TeacherCourseItem = {
  id: string; // TeacherCourse.id
  courseId: string;
  course: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
  };
};

type Props = {
  teacherCourses: TeacherCourseItem[];
};

export default function ExamForm({
  teacherCourses,
}: Props) {
  const [form] = Form.useForm();

  async function onFinish(values: {
    title: string;
    courseId: string;
  }) {
    await createExam(values);

    form.resetFields();
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-2"
    >
      <Form.Item
        name="title"
        label="Exam Title"
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
          placeholder="Midterm Exam"
        />
      </Form.Item>

      <Form.Item
        name="courseId"
        label="Teacher Courses"
        rules={[
          {
            required: true,
            message:
              "Please select a course",
          },
        ]}
      >
        <Select
          size="large"
          showSearch
          placeholder="Select course"
          optionFilterProp="label"
          options={teacherCourses.map(
            (item) => ({
              value:
                item.course.id,
              label: `${item.course.name} (${item.course.code})`,
            })
          )}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
      >
        Create Exam
      </Button>
    </Form>
  );
}