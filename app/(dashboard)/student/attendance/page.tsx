import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentAttendanceClient from "@/components/dashboard/student/attendance-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;

  const records = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: 100,
    include: {
      course: { select: { name: true, code: true } },
    },
  });

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const attendanceRate =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const data = records.map((r) => ({
    id: r.id,
    courseName: r.course.name,
    courseCode: r.course.code,
    status: r.status,
    date: r.date.toISOString(),
  }));

  return (
    <div className="p-6">
      <StudentAttendanceClient
        records={data}
        stats={{ total: totalRecords, present: presentCount, absent: absentCount, rate: attendanceRate }}
      />
    </div>
  );
}
