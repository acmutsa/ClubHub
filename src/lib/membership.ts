import { db } from "@/db/index";
import { clubs, membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function isClubAdmin(userId: string, clubName: string) {
  const club = await db.select().from(clubs).where(eq(clubs.name, clubName));
  if (!club) {
    return false;
  }
  const member = await db
    .select()
    .from(membership)
    .where(
      and(eq(membership.userId, userId), eq(membership.clubId, club[0].id))
    );
  if (!member) {
    return false;
  }
  return member[0].role === "admin" || member[0].role === "super_admin";
}
