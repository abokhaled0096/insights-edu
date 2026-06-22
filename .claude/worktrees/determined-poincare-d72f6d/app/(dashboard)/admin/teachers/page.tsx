import { getTeachersAction } from "@/app/actions/admin/get-teachers"
import TeachersPage from "@/components/dashboard/admin/teachers-clinet-page"

async function AdminTeachersPage() {
    const teachers = await getTeachersAction()
  return (
    <TeachersPage teachers={teachers} />
  )
}

export default AdminTeachersPage