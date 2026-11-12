import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden, notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { clubMemberships, clubRoles, clubs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Permission } from "@/constants/permissions";
import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { getRequestIpAddress } from "@/lib/get-request-ip-address";
import type { CurrentUser } from "@/lib/types/current-user";
import type { ClubContext } from "@/lib/types/club-context";

export type AppSurface = "club" | "platform" | "landing";

export const getAppSurface = cache(async (): Promise<AppSurface> => {
  const scope = (await headers()).get("x-app-scope");

  if (scope === "club") return "club";
  if (scope === "platform") return "platform";
  return "landing";
});

// TO DO: Remove this function we aledy have getCurrentClub() function which is used in getClubContext() function.
export function matchesClubRoute(
  club: { id: string; slug: string },
  routeClubId: string,
) {
  return club.id === routeClubId || club.slug === routeClubId;
}

// TO DO: Remove club id since slug is unique for each club and will be used in the url.  
export const getCurrentClub = cache(async () => {
  const requestHeaders = await headers();
  const scope = requestHeaders.get("x-app-scope");
  const clubId = requestHeaders.get("x-club-id");
  const clubSlug = requestHeaders.get("x-club-slug");

  if (scope !== "club" || (!clubId && !clubSlug)) return null;

  const clubFilter = clubSlug ? eq(clubs.slug, clubSlug) : eq(clubs.id, clubId!);

  return (
    (await db.query.clubs.findFirst({
      where: and(clubFilter, isNull(clubs.deletedAt)),
    })) ?? null
  );
});

async function buildClubContext(user: CurrentUser): Promise<ClubContext | null> {

  const club = await getCurrentClub();
  if (!club) return null;

  const membership =
    (await db.query.clubMemberships.findFirst({
      where: and(
        eq(clubMemberships.clubId, club.id),
        eq(clubMemberships.userId, user.id),
        eq(clubMemberships.applicationStatus, "approved"),
        eq(clubMemberships.status, "active"),
        isNull(clubMemberships.deletedAt),
      ),
    })) ?? null;

  if (!membership) return null;

  const role =
    (await db.query.clubRoles.findFirst({
      where: and(
        eq(clubRoles.id, membership.roleId),
        eq(clubRoles.clubId, club.id),
      ),
    })) ?? null;

  if (!role) return null;

  const storedPermissions = Array.isArray(role.permissions) ? role.permissions : [];
  const permissions = storedPermissions.filter((permission): permission is Permission => Object.values(Permission).includes(permission));

  const ipAddress = await getRequestIpAddress();

  return {
    user,
    club,
    clubId: club.id,
    membership,
    role,
    permissions,
    ipAddress,
    hasPermission: (permission) => permissions.includes(permission),
    requirePermission: (permission) => { if (!permissions.includes(permission)) forbidden(); },
  };
}

export const getClubContext = cache(async (): Promise<ClubContext | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  return buildClubContext(user);
});

export async function requireClubContext(): Promise<ClubContext> {
  const user = await getCurrentUser();
  if (!user) return redirectToSignIn();

  const club = await getCurrentClub();
  if (!club) notFound();

  const context = await getClubContext();
  if (!context) forbidden();

  return context;
}
