"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function isSuperAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        unauthorized();
    }

    return session.user.role === "super_admin";
}