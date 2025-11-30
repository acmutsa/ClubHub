'use server'
import { membership } from "../schema";
import { and, eq } from "drizzle-orm";
import { db } from "../index";

export async function leaveClub(userId: string, clubId: number) {
    await db.delete(membership).where(and(eq(membership.userId, userId),eq(membership.clubId, clubId)));
};

export async function joinClub(userId: string, clubId: number) {
    await db.insert(membership).values({
        userId,
        clubId,
    });
}

