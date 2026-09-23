import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden, notFound } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { clubs, memberships } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { ClubPermissionType } from "@/lib/auth/permissions";
import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";

export type AppSurface = "club" | "platform" | "landing";

export const getAppSurface = cache(async (): Promise<AppSurface> => {
  const scope = (await headers()).get("x-app-scope");

  if (scope === "club") return "club";
  if (scope === "platform") return "platform";

  return "landing";
});

export const getCurrentClub = cache(async () => {
  const requestHeaders = await headers();
  const scope = requestHeaders.get("x-app-scope");
  const clubId = requestHeaders.get("x-club-id");
  const clubSlug = requestHeaders.get("x-club-slug");

  if (scope !== "club" || (!clubId && !clubSlug)) {
    return null;
  }

  return (
    (await db.query.clubs.findFirst({
      where: clubSlug ? eq(clubs.slug, clubSlug) : eq(clubs.id, clubId!),
    })) ?? null
  );
});

export function matchesClubRoute(
  club: { id: string; slug: string },
  routeClubId: string,
) {
  return club.id === routeClubId || club.slug === routeClubId;
}

async function buildClubContext(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
) {
  const requestHeaders = await headers();
  const club = await getCurrentClub();

  if (!club) {
    notFound();
  }

  const membership =
    (await db.query.memberships.findFirst({
      where: and(
        eq(memberships.clubId, club.id),
        eq(memberships.userId, user.id),
      ),
    })) ?? null;

  if (!membership) {
    forbidden();
  }

  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    null;
  const permissions: ClubPermissionType[] = [];

  return {
    user,
    club,
    clubId: club.id,
    membership,
    permissions,
    ipAddress,
  };
}

export const getOptionalClubContext = cache(async () => {
  const user = await getCurrentUser();

  if (!user) return null;

  return buildClubContext(user);
});

export const getClubContext = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirectToSignIn();
  }

  return buildClubContext(user);
});

export async function requireClubContext() {
  return getClubContext();
}

export type ClubContext = Awaited<ReturnType<typeof getClubContext>>;
