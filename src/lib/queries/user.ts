"use server"

import { db } from "@/db"
import { user, membership, clubs } from "@/db/schema"
import { sql, eq } from "drizzle-orm/sql";
import { unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminUserRow } from "@/lib/types/user";

export async function getAllUsersData(): Promise<AdminUserRow[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        unauthorized();
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
        unauthorized();
    }

    const rows = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clubCount: sql<number>`COUNT(${membership.slug})`,
            clubs: sql<string>`
            COALESCE(
                json_group_array(
                json_object(
                    'id', ${clubs.slug},
                    'name', ${clubs.name}
                )
                ),
                json('[]')
            )
            `,
        })
        .from(user)
        .leftJoin(membership, eq(membership.userId, user.id))
        .leftJoin(clubs, eq(clubs.slug, membership.slug))
        .groupBy(user.id);

    const users: AdminUserRow[] = rows.map((row) => ({
        ...row,
        clubs: JSON.parse(row.clubs),
    }));
    
    return users;
}

export async function getRolesCounts() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        unauthorized();
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
        unauthorized();
    }

    const rows = await db
        .select({
            role: user.role,
            count: sql<number>`count(*)`,
        })
        .from(user)
        .groupBy(user.role);

    const result = {
    superAdminCount: 0,
    adminCount: 0,
    regularCount: 0,
    };

    for (const row of rows) {
        if (row.role === "super_admin") result.superAdminCount = row.count;
        if (row.role === "admin") result.adminCount = row.count;
        if (row.role === "user") result.regularCount = row.count;
    }

    return result;
}