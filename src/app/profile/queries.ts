import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/index";
import { user } from "@/db/auth-schema";
import {
  clubMemberships,
  clubRoles,
  clubs,
  files,
  userProfiles,
} from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";

// CLUB LOGOS: this may need to change with the incoming blob changes
function getFileUrl(storageKey: string | null) {
  const baseUrl = process.env.R2_PUBLIC_URL;
  if (!storageKey || !baseUrl) return null;

  return `${baseUrl.replace(/\/+$/, "")}/${encodeURI(storageKey)}`;
}

// Everything the /profile page shows, for the signed-in user only.
// The user id comes from the session; requireCurrentUser already rejects soft-deleted users.
export async function getProfilePageData() {
  const currentUser = await requireCurrentUser();

  const [[profile], myClubs] = await Promise.all([
    db
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
      // left join: a user who hasn't finished registration has no profile row yet
      .leftJoin(
        userProfiles,
        and(eq(userProfiles.userId, user.id), isNull(userProfiles.deletedAt)),
      )
      .where(eq(user.id, currentUser.id))
      .limit(1),

    db
      .select({
        id: clubs.id,
        slug: clubs.slug,
        name: clubs.name,
        description: clubs.description,
        logoStorageKey: files.storageKey,
        role: clubRoles.name,
        status: clubMemberships.status,
        joinedAt: clubMemberships.createdAt,
      })
      .from(clubMemberships)
      .innerJoin(clubs, eq(clubs.id, clubMemberships.clubId))
      // role must belong to the same club
      .innerJoin(
        clubRoles,
        and(
          eq(clubRoles.clubId, clubMemberships.clubId),
          eq(clubRoles.id, clubMemberships.roleId),
        ),
      )
      .leftJoin(files, eq(files.id, clubs.logoFileId))
      .where(
        and(
          eq(clubMemberships.userId, currentUser.id),
          eq(clubMemberships.applicationStatus, "approved"),
          isNull(clubMemberships.deletedAt),
          isNull(clubs.deletedAt),
        ),
      )
      // "active" sorts before "inactive", so active clubs come first
      .orderBy(asc(clubMemberships.status), asc(clubs.name)),
  ]);

  return {
    profile,
    clubs: myClubs.map(({ logoStorageKey, ...club }) => ({
      ...club,
      logoUrl: getFileUrl(logoStorageKey),
    })),
  };
}
