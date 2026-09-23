import { eq } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";

import { db } from "@/db/index";
import { memberships, user } from "@/db/schema";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";

export async function listClubMembers(clubId: string) {
  const context = await requireAuthContext();

  if (!matchesClubRoute(context.club, clubId)) notFound();

  const isClubAdmin =
    context.membership.role === "ADMIN" ||
    context.membership.role === "SUPER_ADMIN";

  if (!isClubAdmin) forbidden();

  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: memberships.role,
      clubId: memberships.clubId,
    })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .where(eq(memberships.clubId, context.clubId));
}
