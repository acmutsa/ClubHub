"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
    const pathname = usePathname();
    const segment = pathname.split('/');
    const isActive = (href: string) => {
        if (pathname === href) {
            return true;
        }
        const temp = "/" + segment[1] + "/" + segment[2];
        if (temp === href) {
            return true;
        }
        return false;
    }

    return (
        <div className="w-full p-4 md:p-6">
            <ul className="flex justify-center gap-2 md:gap-4">
                <li>
                    <Link href={"/admin"}>
                        <Button 
                            variant={"default"}
                            className={`cursor-pointer ${
                                isActive("/admin") ? "bg-blue-500" : ""
                        }`}>
                            Dashboard
                        </Button>
                    </Link>
                </li>
                <li>
                    <Link href={"/admin/clubs"}>
                        <Button 
                            variant={"default"}
                            className={`cursor-pointer ${
                                isActive("/admin/clubs") ? "bg-blue-500" : ""
                        }`}>
                            Clubs
                        </Button>
                    </Link>
                </li>
                <li>
                    <Link href={"/admin/users"}>
                        <Button 
                            variant={"default"}
                            className={`cursor-pointer ${
                                isActive("/admin/users") ? "bg-blue-500" : ""
                        }`}>
                            Users
                        </Button>
                    </Link>
                </li>
                <li>
                    <Link href={"/admin/events"}>
                        <Button 
                            variant={"default"}
                            className={`cursor-pointer ${
                                isActive("/admin/events") ? "bg-blue-500" : ""
                        }`}>
                            Events
                        </Button>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
