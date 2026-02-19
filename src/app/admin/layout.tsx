import Navbar from "@/components/navbar";
import AdminNavbar from "@/features/admin/components/admin-navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children, 
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return redirect("/sign-in");
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
        // make a 404 page
        return <div>404</div>
    }
    const userType = role === "admin" || role === "super_admin" ? "admin" : "member";

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar clubName={"ACM UTSA"} clubId={"0"} userType={userType}/>
            <main className="flex-1 flex flex-col">
                <AdminNavbar />
                {children}
            </main>
        </div>
    );
}
