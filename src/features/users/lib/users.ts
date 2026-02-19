"use server";
import { db } from "@/db";
import { user } from "@/db/auth.schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { User } from "./types/users";

export async function updateUser(userIdToUpdate: string, updates: Partial<User>) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Not authenticated");
    const userRole = session.user.role;
    if (userRole !== "super_admin") {
        throw new Error("Unauthorized User!");
    }
    return db
        .update(user)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(user.id, userIdToUpdate));
}
