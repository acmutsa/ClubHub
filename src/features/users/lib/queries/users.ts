"use server"
import { db } from "@/db"
import { user } from "@/db/schema"
import { sql } from "drizzle-orm";

export async function getRolesCounts() {
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