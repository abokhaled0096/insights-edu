/// app/teacher/assignments/page.tsx
import { getTeacherAssignments, getTeacherCourses } from "@/app/actions/teacher/assignments/assignments";
import AssignmentsClientPage from "@/components/dashboard/teacher/assignment/client-page";

export default async function TeacherAssignmentsPage() {
  const rawAssignments = await getTeacherAssignments();
  const courses = await getTeacherCourses();

  // Serialize Date objects for client component
  const assignments = rawAssignments.map((a: any) => ({
    ...a,
    dueDate: a.dueDate?.toISOString ? a.dueDate.toISOString() : a.dueDate,
    createdAt: a.createdAt?.toISOString ? a.createdAt.toISOString() : a.createdAt,
    updatedAt: a.updatedAt?.toISOString ? a.updatedAt.toISOString() : a.updatedAt,
    course: a.course ? {
      ...a.course,
      createdAt: a.course.createdAt?.toISOString ? a.course.createdAt.toISOString() : a.course.createdAt,
      updatedAt: a.course.updatedAt?.toISOString ? a.course.updatedAt.toISOString() : a.course.updatedAt,
    } : a.course,
    submissions: a.submissions?.map((s: any) => ({
      ...s,
      submittedAt: s.submittedAt?.toISOString ? s.submittedAt.toISOString() : s.submittedAt,
    })) || [],
  }));

  return <AssignmentsClientPage initialAssignments={assignments} courses={courses} />;
}