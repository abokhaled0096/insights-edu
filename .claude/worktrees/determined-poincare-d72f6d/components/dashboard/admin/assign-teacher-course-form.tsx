"use client";

import { Form, Select, Button } from "antd";
import { assignTeacherCourse } from "@/app/actions/admin/teacher-course";

export default function AssignTeacherCourseForm({
  teacherId,
  courses,
}: any) {
  async function onFinish(values: any) {
    await assignTeacherCourse({
      teacherId,
      courseId: values.courseId,
    });
  }

  return (
    <Form layout="inline" onFinish={onFinish}>
      <Form.Item name="courseId" required>
        <Select
          style={{ width: 250 }}
          placeholder="Choose Course"
          options={courses.map((c: any) => ({
            label: c.name,
            value: c.id,
          }))}
        />
      </Form.Item>

      <Button htmlType="submit" type="primary">
        Assign
      </Button>
    </Form>
  );
}