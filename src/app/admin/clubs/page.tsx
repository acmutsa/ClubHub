import AdminClubTable from "@/components/admin/clubs/club-table";
import { isSuperAdmin } from "@/lib/user";

export default async function AdminClubPage() {
    const superAdmin = await isSuperAdmin();
    
    return (
        <div>
            <AdminClubTable isSuperAdmin={superAdmin}/>
        </div>
    );
} 