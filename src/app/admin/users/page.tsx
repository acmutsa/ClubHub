import AdminUserTable from "@/features/users/components/admin-user-table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/features/users/lib/types/users";

export default async function AdminUserPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return redirect("/sign-in");
  }
  const user = {
    id: session.user.id,
    role: session.user.role as UserRole,
  };
  
  return (
    <div>
      <AdminUserTable user={user}/>
    </div>
  );
}
