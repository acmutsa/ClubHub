"use server";

import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ALL_PERMISSIONS } from "@/constants/permissions";
import { MEMBER_ROLE_POSITION, OWNER_ROLE_POSITION } from "@/constants/role-positions";
import { db } from "@/db";
import {
  clubMemberships,
  clubRoles,
  clubs,
  clubTitles,
  userProfiles,
} from "@/db/schema";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";

const clubMembershipSchema = z.object({
  clubId: z.string().min(1, "Club ID is required."),
});

const createClubSchema = z.object({
  name: z.string().min(1, "Club name is required."),
  description: z.string().min(1, "Description is required."),
});

function createClubSlug(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function getOrCreateMemberRoleId(clubId: string) {
  let [role] = await db
    .select({ id: clubRoles.id })
    .from(clubRoles)
    .where(and(eq(clubRoles.clubId, clubId), eq(clubRoles.name, "MEMBER")))
    .limit(1);

  if (!role) {
    await db
      .insert(clubRoles)
      .values({
        clubId,
        name: "MEMBER",
        description: "Default role for club members",
        permissions: [],
        color: "#71717a",
        position: MEMBER_ROLE_POSITION,
        isSystem: true,
      })
      .onConflictDoNothing();

    [role] = await db
      .select({ id: clubRoles.id })
      .from(clubRoles)
      .where(and(eq(clubRoles.clubId, clubId), eq(clubRoles.name, "MEMBER")))
      .limit(1);
  }

  if (!role) {
    throw new Error(`Could not find or create the member role for club "${clubId}".`);
  }

  return role.id;
}

async function getOrCreateMemberTitleId(clubId: string) {
  let [title] = await db
    .select({ id: clubTitles.id })
    .from(clubTitles)
    .where(and(eq(clubTitles.clubId, clubId), eq(clubTitles.name, "Member")))
    .limit(1);

  if (!title) {
    await db
      .insert(clubTitles)
      .values({ clubId, name: "Member" })
      .onConflictDoNothing();

    [title] = await db
      .select({ id: clubTitles.id })
      .from(clubTitles)
      .where(and(eq(clubTitles.clubId, clubId), eq(clubTitles.name, "Member")))
      .limit(1);
  }

  if (!title) {
    throw new Error(`Could not find or create the member title for club "${clubId}".`);
  }

  return title.id;
}

export const leaveClubAction = createAuthenticatedSafeAction(
  { schema: clubMembershipSchema },
  async ({ clubId }, context) => {
    await db
      .delete(clubMemberships)
      .where(
        and(
          eq(clubMemberships.userId, context.user.id),
          eq(clubMemberships.clubId, clubId),
        ),
      );

    revalidatePath("/");
    revalidatePath("/clubs");
  },
);

export const joinClubAction = createAuthenticatedSafeAction(
  { schema: clubMembershipSchema },
  async ({ clubId }, context) => {
    const [profile] = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(
        and(
          eq(userProfiles.userId, context.user.id),
          isNull(userProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!profile) {
      return { joined: false as const, reason: "registration-required" as const };
    }

    const [club] = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(eq(clubs.id, clubId))
      .limit(1);

    if (!club) {
      throw new Error(`Cannot join unknown club "${clubId}".`);
    }

    const [roleId, titleId] = await Promise.all([
      getOrCreateMemberRoleId(clubId),
      getOrCreateMemberTitleId(clubId),
    ]);

    await db
      .insert(clubMemberships)
      .values({
        userId: context.user.id,
        clubId,
        roleId,
        titleId,
      })
      .onConflictDoNothing();

    revalidatePath("/");
    revalidatePath("/clubs");
    return { joined: true as const };
  },
);

export const createClubAction = createAuthenticatedSafeAction(
  { schema: createClubSchema },
  async ({ name, description }, context) => {
    const [profile] = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(
        and(
          eq(userProfiles.userId, context.user.id),
          isNull(userProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!profile) {
      return { created: false as const, reason: "registration-required" as const };
    }

    const clubId = randomUUID();
    const baseSlug = createClubSlug(name) || "club";
    const existingClub = await db.query.clubs.findFirst({
      where: eq(clubs.slug, baseSlug),
      columns: { id: true },
    });
    const slug = existingClub ? `${baseSlug}-${clubId.slice(0, 8)}` : baseSlug;

    await db.transaction(async (transaction) => {
      await transaction.insert(clubs).values({
        id: clubId,
        name,
        description,
        createdById: context.user.id,
        slug,
      });

      await transaction.insert(clubRoles).values([
        {
          clubId,
          name: "MEMBER",
          description: "Default role for club members",
          permissions: [],
          color: "#71717a",
          position: MEMBER_ROLE_POSITION,
          isSystem: true,
        },
        {
          clubId,
          name: "OWNER",
          description: "Full access to the club",
          permissions: ALL_PERMISSIONS,
          color: "#3b82f6",
          position: OWNER_ROLE_POSITION,
          isSystem: true,
        },
      ]);
      const [{ id: ownerRoleId }] = await transaction
        .select({ id: clubRoles.id })
        .from(clubRoles)
        .where(and(eq(clubRoles.clubId, clubId), eq(clubRoles.name, "OWNER")))
        .limit(1);

      await transaction.insert(clubTitles).values({ clubId, name: "Member" });
      const [{ id: memberTitleId }] = await transaction
        .select({ id: clubTitles.id })
        .from(clubTitles)
        .where(and(eq(clubTitles.clubId, clubId), eq(clubTitles.name, "Member")))
        .limit(1);

      await transaction.insert(clubMemberships).values({
        userId: context.user.id,
        clubId,
        roleId: ownerRoleId,
        titleId: memberTitleId,
      });
    });

    revalidatePath("/");
    revalidatePath("/clubs");

    return { created: true as const, clubId, slug };
  },
);
