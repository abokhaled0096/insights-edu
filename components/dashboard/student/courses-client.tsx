"use client";

import { Card, Tag, Empty, Row, Col } from "antd";
import { BookOpen, Users, GraduationCap, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Course = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  studentsCount: number;
  teachersCount: number;
  teacherName: string;
};

type Props = { courses: Course[] };

export default function StudentCoursesClient({ courses }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>
          كورساتي
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          جميع المقررات المسجل بها
        </p>
      </div>

      {courses.length === 0 ? (
        <Empty description="لا توجد كورسات مسجلة" />
      ) : (
        <Row gutter={[16, 16]}>
          {courses.map((course) => (
            <Col xs={24} md={12} lg={8} key={course.id}>
            <Link href={`/student/courses/${course.id}`} className="block h-full">
              <Card
                className="rounded-2xl shadow-sm h-full hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderTop: "3px solid #F58220" }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "#002060" }}
                      >
                        {course.name}
                      </h3>
                      <Tag color="orange" className="mt-1">
                        {course.code}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={20} color="#F58220" />
                      <ChevronLeft size={14} color="#94a3b8" />
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-sm text-slate-500">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      {course.teacherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {course.studentsCount} طالب
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
