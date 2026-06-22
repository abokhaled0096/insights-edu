import AdminDashboard from "@/components/dashboard/admin/client-page";
import {
  getAdminStats,
  getRecentUsers,
  getRecentCourses,
  getRecentActivities,
} from "@/app/actions/admin";

export default async function Page() {
  const [stats, users, courses, activities] = await Promise.all([
    getAdminStats(),
    getRecentUsers(),
    getRecentCourses(),
    getRecentActivities(),
  ]);

  return (
    <AdminDashboard
      stats={stats}
      users={users}
      courses={courses}
      activities={activities}
    />
  );
}
