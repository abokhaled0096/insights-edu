import { getTeacherMessagesAction } from "@/app/actions/teacher/send-to-advisor";
import MessagesClient from "@/components/dashboard/teacher/messages-client";

export default async function TeacherMessagesPage() {
  const data = await getTeacherMessagesAction();
  return (
    <div className="p-6">
      <MessagesClient data={data} />
    </div>
  );
}
