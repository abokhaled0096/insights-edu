/// app/teacher/assignments/page.tsx
import { getTeacherAssignments, getTeacherCourses } from "@/app/actions/teacher/assignments/assignments";
import AssignmentsClientPage from "@/components/dashboard/teacher/assignment/client-page";

export default async function TeacherAssignmentsPage() {
  const assignments = await getTeacherAssignments();
    const courses = await getTeacherCourses();
  return <AssignmentsClientPage initialAssignments={assignments} courses={courses} />;
}