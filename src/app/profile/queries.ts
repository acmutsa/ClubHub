import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/index";
import { user } from "@/db/auth-schema";
import { clubMemberships, clubRoles, clubs, userProfiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";

// The signed-in user's details for the profile card.
export async function getCurrentUserProfile() {
  const currentUser = await requireCurrentUser();

  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      memberSince: user.createdAt,
      pronouns: userProfiles.pronouns,
      school: userProfiles.school,
      major: userProfiles.major,
      expectedGraduationDate: userProfiles.expectedGraduationDate,
    })
    .from(user)
    .leftJoin(userProfiles, and(eq(userProfiles.userId, user.id), isNull(userProfiles.deletedAt)))
    .where(eq(user.id, currentUser.id))
    .limit(1);

  return profile;
}

// The signed-in user's approved club memberships, active clubs first.
export async function getCurrentUserClubMemberships() {
  const currentUser = await requireCurrentUser();

  const memberships = await db
    .select({
      id: clubs.id,
      slug: clubs.slug,
      name: clubs.name,
      description: clubs.description,
      role: clubRoles.name,
      status: clubMemberships.status,
      joinedAt: clubMemberships.createdAt,
    })
    .from(clubMemberships)
    .innerJoin(clubs, eq(clubs.id, clubMemberships.clubId))
    .innerJoin(
      clubRoles,
      and(eq(clubRoles.clubId, clubMemberships.clubId), eq(clubRoles.id, clubMemberships.roleId)),
    )
    .where(
      and(
        eq(clubMemberships.userId, currentUser.id),
        eq(clubMemberships.applicationStatus, "approved"),
        isNull(clubMemberships.deletedAt),
        isNull(clubs.deletedAt),
      ),
    )
    .orderBy(asc(clubMemberships.status), asc(clubs.name));

  // TODO: join files on clubs.logoFileId and build the URL from its storage key once blob storage exists
  return memberships.map((club) => ({ ...club, logoUrl: null as string | null }));
}

export type ProfileClubMembership = Awaited<ReturnType<typeof getCurrentUserClubMemberships>>[number];
