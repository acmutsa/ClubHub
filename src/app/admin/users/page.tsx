import AdminUserTable from "@/components/admin/user/user-table";
import { isSuperAdmin } from "@/lib/user";

export default async function AdminUserPage() {
    const superAdmin = await isSuperAdmin();

    return (
        <div>
            <AdminUserTable isSuperAdmin={superAdmin}/>
        </div>
    );
}