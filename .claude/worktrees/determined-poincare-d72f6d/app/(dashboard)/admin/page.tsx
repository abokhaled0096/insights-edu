import AdminDashboard from "@/components/dashboard/admin/client-page";
import {
  getAdminStats,
  getRecentUsers,
  getRecentCourses,
  getRecentActivities,
} from "@/app/actions/admin";

export default async function Page() {
  const [stats, users, rawCourses, rawActivities] = await Promise.all([
    getAdminStats(),
    getRecentUsers(),
    getRecentCourses(),
    getRecentActivities(),
  ]);

  const courses = rawCourses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    studentsCount: course._count.students,
    teacherName: course.teachers[0]?.teacher?.name || "بدون مدرس",
  }));

  const activities = rawActivities.map((item) => ({
    id: item.id,
    action: item.action,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <AdminDashboard
      stats={stats}
      users={users}
      courses={courses}
      activities={activities}
    />
  );
}
