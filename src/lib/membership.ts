import { db } from "@/db/index";
import { membership, clubs, membershipRole, clubRoles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ADMIN_MASK } from "./types/club-admin";

type MemberRole = Awaited<ReturnType<typeof getMemberRoles>>[number];

export async function isInClub(userId: string, clubId: string) {
  const member = await db
    .select()
    .from(membership)
    .where(and(eq(membership.userId, userId), eq(membership.clubId, clubId)));
  return member.length > 0;
}

export async function getMemberRoles(userId: string, clubId: string) {
  const roles = await db
    .select({
      roleId: clubRoles.id,
      name: clubRoles.name,
      permissions: clubRoles.permissions,
      position: clubRoles.position,
    })
    .from(membership)
    .innerJoin(
      membershipRole,
      eq(membershipRole.membershipId, membership.id)
    )
    .innerJoin(
      clubRoles,
      eq(clubRoles.id, membershipRole.roleId)
    )
    .where(
      and(
        eq(membership.userId, userId),
        eq(membership.clubId, clubId)
      )
    );
    return roles;
}

export async function isClubAdmin(userId: string, clubId: string) {
  const roles = await db
    .select({
      permissions: clubRoles.permissions,
    })
    .from(membership)
    .innerJoin(
      membershipRole,
      eq(membershipRole.membershipId, membership.id)
    )
    .innerJoin(
      clubRoles,
      eq(clubRoles.id, membershipRole.roleId)
    )
    .where(
      and(
        eq(membership.userId, userId),
        eq(membership.clubId, clubId)
      )
    );

  return roles.some(
    (role) => (role.permissions & ADMIN_MASK) !== 0
  );
}

export async function isClubOwner(userId: string, clubId: string) {
  const club = await db.select().from(clubs).where(eq(clubs.id, clubId));
  if (club.length === 0) {
    return false;
  }
  return club[0].ownerId === userId;
}

export async function hasClubPermission(
  userId: string,
  slug: string,
  permission: number
) {
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });
  if (!club) return false;

  if (club.ownerId === userId) {
    return true;
  }

  const roles = await db
    .select({
      permissions: clubRoles.permissions,
    })
    .from(membership)
    .innerJoin(
      membershipRole,
      eq(membershipRole.membershipId, membership.id)
    )
    .innerJoin(
      clubRoles,
      eq(clubRoles.id, membershipRole.roleId)
    )
    .where(
      and(
        eq(membership.userId, userId),
        eq(membership.clubId, club.id)
      )
    );

    return roles.some(
      (role) => (role.permissions & permission) !== 0
    );
}