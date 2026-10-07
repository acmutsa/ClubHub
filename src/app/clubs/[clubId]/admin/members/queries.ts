import { and, eq, isNull } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";

import { db } from "@/db/index";
import { clubMemberships, clubRoles, user } from "@/db/schema";
import { Permission } from "@/constants/permissions";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";

export async function listClubMembers(clubId: string) {
  const context = await requireAuthContext();

  if (!matchesClubRoute(context.club, clubId)) notFound();

  if (!context.hasPermission(Permission.MEMBERS_VIEW)) forbidden();

  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: clubRoles.name,
      clubId: clubMemberships.clubId,
    })
    .from(clubMemberships)
    .innerJoin(user, eq(user.id, clubMemberships.userId))
    .innerJoin(clubRoles, eq(clubRoles.id, clubMemberships.roleId))
    .where(and(eq(clubMemberships.clubId, context.clubId), isNull(clubMemberships.deletedAt)));
}
