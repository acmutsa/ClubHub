import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllUsersData } from "@/lib/queries/user";
import AdminUserTable from "@/components/admin/user/user-table";

export default async function AdminUserPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const isSuperAdmin = session?.user.role === "super_admin";
    const data = await getAllUsersData();

    return (
        <div className="">
            <AdminUserTable data={data} isSuperAdmin={isSuperAdmin}/>
        </div>
    );
}