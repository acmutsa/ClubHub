import { db } from "@/db/index";
import { clubs,membership,user } from "@/db/schema";
import { eq } from "drizzle-orm";
export async function getClub(clubId: string) {
  if (!clubId?.trim()) {
    return null;
  }
  const club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
  return club || null;
}

export async function getMembers(clubId: string){
  if(!clubId?.trim()){
    return null
  }
  const members = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
        club: membership.clubId
      }).from(membership).innerJoin(user,eq (user.id,membership.userId)).
      where(eq(membership.clubId,clubId));
  return members;
}