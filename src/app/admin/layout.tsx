import Navbar from "@/components/navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminLayout({
    children,
}: Readonly <{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return <div>404</div>
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
        return <div>404</div>
    }
    const userType = role === "admin" || role === "super_admin" ? "admin" : "member";

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar clubName={"ACM UTSA"} clubId={"0"} userType={userType} baseUrl={""}/>
            <SidebarProvider className="relative flex flex-1 min-h-0">
                <AdminSidebar />
                <main className="flex flex-col flex-1">
                    <SidebarTrigger />
                    <div className="flex-1 px-2 py-4">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}