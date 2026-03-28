"use server";
import { db } from "@/db";
import { user } from "@/db/auth.schema";
import { eq } from "drizzle-orm/sql";
import type { UserRole } from "@/lib/types/user";
import { isSuperAdmin } from "@/lib/user";

export async function updateUserName(userId: string, newName: string) {
    const superAdmin = await isSuperAdmin();
    if (!superAdmin) return;

    await db
        .update(user)
        .set({ name: newName })
        .where(eq(user.id, userId));
}

export async function updateUserEmail(userId: string, newEmail: string) {
    const allowed = await isSuperAdmin();
    if (!allowed) return;

    await db
        .update(user)
        .set({ email: newEmail })
        .where(eq(user.id, userId));
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const allowed = await isSuperAdmin();
    if (!allowed) return;

    await db
        .update(user)
        .set({ role: newRole })
        .where(eq(user.id, userId));
}

export async function updateUserClubs() {
    const allowed = await isSuperAdmin();
    if (!allowed) return;
}