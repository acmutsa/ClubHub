import { isSuperAdmin } from "@/lib/user";

export default async function AdminEventPage() {
    const superAdmin = await isSuperAdmin();
    
    return (
        <div className="">
            Event
        </div>
    );
}