'use client'
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function SignOutButton() {
    const router = useRouter();
    return <Button className="w-full justify-start p-2" variant="ghost" onClick={async () => {
        await authClient.signOut();
        router.refresh();
    }}>Sign Out</Button>;
}