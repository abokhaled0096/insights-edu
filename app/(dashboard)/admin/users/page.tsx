import UsersClient from "@/components/dashboard/admin/users-client";
import { getAllUsersAction } from "@/app/actions/admin/get-users";

export default async function Page() {
  const users = await getAllUsersAction();
  return (
    <div className="p-6">
      <UsersClient users={users} />
    </div>
  );
}