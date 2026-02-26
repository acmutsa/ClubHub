import { db } from "@/db/index";
import { clubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql"
import { unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getClub(clubId: string) {
  if (!clubId?.trim()) {
    return null;
  }
  const club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
  return club || null;
}

export async function getAdminTotalClubCount(): Promise<number> {
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
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clubs);

  return result[0]?.count ?? 0;
}