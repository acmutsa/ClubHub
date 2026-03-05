import { isSuperAdmin } from "@/lib/user";
import AdminEventTable from "@/components/admin/events/event-table";

export default async function AdminEventPage() {
    const superAdmin = await isSuperAdmin();

    return (
        <div>
            <AdminEventTable isSuperAdmin={superAdmin}/>
        </div>
    );
}