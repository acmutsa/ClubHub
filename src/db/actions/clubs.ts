import { membership } from "../schema";
import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { revalidatePath } from "next/cache";
export async function leaveClub(userId: string, clubId: number) {
    'use server'
    await db.delete(membership).where(and(eq(membership.userId, userId),eq(membership.clubId, clubId)));
    revalidatePath("/clubs");
};

export async function joinClub(userId: string, clubId: number) {
    'use server'
    await db.insert(membership).values({
        userId,
        clubId,
    });
    revalidatePath("/clubs");
}

