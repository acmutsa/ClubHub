import AdminUserTable from "@/components/admin/user/user-table";
import { isSuperAdmin } from "@/lib/user";

export default async function AdminClubPage() {
    const superAdmin = await isSuperAdmin();

    return (
        <div className="max-w-full">
            <AdminUserTable isSuperAdmin={superAdmin}/>
        </div>
    );
} 