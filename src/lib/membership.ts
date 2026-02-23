import { db } from "@/db/index";
import { membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getClubBySlug } from "./queries/club";
export default async function isClubAdmin(userId: string, slug: string) {
  
  const club = await getClubBySlug(slug);
  if(!club){
    return false;
  }
  const member = await db
    .select()
    .from(membership)
    .where(and(eq(membership.userId, userId), eq(membership.clubId, club.id)));
  if (member.length === 0) {
    return false;
  }
  return member[0].role === "admin" || member[0].role === "super_admin";
}
