import { db } from "@/db/index";
import { membership, clubs } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function isClubAdmin(userId: string, clubId: string) {
  const member = await db
    .select()
    .from(membership)
    .where(and(eq(membership.userId, userId), eq(membership.clubId, clubId)));
  if (member.length === 0) {
    return false;
  }
  return member[0].role === "admin" || member[0].role === "super_admin";
}
export async function isClubOwner(userId: string, clubId: string) {
  const club = await db.select().from(clubs).where(eq(clubs.id, clubId));
  if (club.length === 0) {
    return false;
  }
  return club[0].owner === userId;
}
