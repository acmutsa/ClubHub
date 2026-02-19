import AdminUserGraph from "@/features/users/components/admin-user-graph";
import { getRolesCounts } from "@/features/users/lib/queries/users";

export default async function AdminDashboardPage() {
  
  const data = await getRolesCounts();
  return (
    <div className="flex justify-center">
      <AdminUserGraph data={data}/>
    </div>
  );
}
