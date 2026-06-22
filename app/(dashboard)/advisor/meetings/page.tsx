import { getAdvisorMeetingsAction } from "@/app/actions/advisor/get-meetings";
import { getAdvisorStudentsAction } from "@/app/actions/advisor/get-students";
import MeetingsClient from "@/components/dashboard/advisor/meetings-client";

export default async function AdvisorMeetingsPage() {
  const [meetings, students] = await Promise.all([
    getAdvisorMeetingsAction(),
    getAdvisorStudentsAction(),
  ]);

  const studentsList = students.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="p-6">
      <MeetingsClient meetings={meetings} students={studentsList} />
    </div>
  );
}
