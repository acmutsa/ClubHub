'use client'
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function SignOutButton() {
    const router = useRouter();
    return <Button onClick={async () => {
        await authClient.signOut();
        router.refresh();
    }}>Sign out</Button>;
}