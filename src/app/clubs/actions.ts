"use server";

import { randomUUID } from "crypto";
import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { clubMemberships, clubRoles, clubTitles, clubs } from "@/db/schema";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { createClubMembershipSchema } from "@/lib/validators/club-membership";
import { createClubFormSchema } from "@/lib/validators/club";
import { SYSTEM_CLUB_ROLES } from "@/constants/roles";
import { ActionErrorCode } from "@/lib/actions/action-error-code";
import { actionError } from "@/lib/actions/create-safe-action";

function createClubSlug(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const leaveClubAction = createAuthenticatedSafeAction(
  { schema: createClubMembershipSchema },
  async ({ clubId }, context) => {
    await db.transaction(async (transaction) => {
      const membership = await transaction.query.clubMemberships.findFirst({
        where: and(eq(clubMemberships.userId, context.user.id), eq(clubMemberships.clubId, clubId)),
        with: { role: true },
      });
      if (!membership || membership.deletedAt) throw actionError(ActionErrorCode.NOT_FOUND, "Membership was not found.");
      if (membership.status !== "active" || membership.applicationStatus !== "approved") {
        throw actionError(ActionErrorCode.FORBIDDEN, "Your membership must be restored by a club administrator.");
      }
      if (membership.role.name === "OWNER") {
        const owners = await transaction.query.clubMemberships.findMany({
          where: and(eq(clubMemberships.clubId, clubId), eq(clubMemberships.roleId, membership.roleId)),
        });
        if (owners.filter((owner) => !owner.deletedAt && owner.status === "active" && owner.applicationStatus === "approved").length <= 1) {
          throw actionError(ActionErrorCode.FORBIDDEN, "Transfer ownership before leaving this club.");
        }
      }
      await transaction.delete(clubMemberships).where(
        and(eq(clubMemberships.userId, context.user.id), eq(clubMemberships.clubId, clubId)),
      );
    });

    revalidatePath("/clubs");
  },
);

export const joinClubAction = createAuthenticatedSafeAction(
  { schema: createClubMembershipSchema },
  async ({ clubId }, context) => {
    const club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
    if (!club || club.deletedAt) throw actionError(ActionErrorCode.NOT_FOUND, "Club was not found.");
    const [role, title] = await Promise.all([
      db.query.clubRoles.findFirst({ where: and(eq(clubRoles.clubId, clubId), eq(clubRoles.name, "MEMBER")) }),
      db.query.clubTitles.findFirst({ where: and(eq(clubTitles.clubId, clubId), eq(clubTitles.name, "Member")) }),
    ]);
    if (!role || !title) throw actionError(ActionErrorCode.SERVER_ERROR, "Club membership is not configured.");
    const existingMembership = await db.query.clubMemberships.findFirst({ where: and(eq(clubMemberships.userId, context.user.id), eq(clubMemberships.clubId, clubId)) });
    if (existingMembership && !existingMembership.deletedAt) {
      if (existingMembership.status === "active" && existingMembership.applicationStatus === "approved") return;
      throw actionError(ActionErrorCode.FORBIDDEN, "Your membership must be restored by a club administrator.");
    }
    if (existingMembership) {
      await db.update(clubMemberships)
        .set({ roleId: role.id, titleId: title.id, applicationStatus: "approved", status: "active", inactiveAt: null, deletedAt: null })
        .where(and(eq(clubMemberships.userId, context.user.id), eq(clubMemberships.clubId, clubId), isNotNull(clubMemberships.deletedAt)));
    } else {
      await db.insert(clubMemberships).values({ userId: context.user.id, clubId, roleId: role.id, titleId: title.id }).onConflictDoNothing();
    }

    revalidatePath("/clubs");
  },
);

export const createClubAction = createAuthenticatedSafeAction(
  { schema: createClubFormSchema },
  async ({ name, description }, context) => {
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
      const roles = await transaction.insert(clubRoles).values(SYSTEM_CLUB_ROLES.map((role) => ({ ...role, permissions: [...role.permissions], clubId }))).returning();
      const [title] = await transaction.insert(clubTitles).values({ clubId, name: "Member" }).returning();
      const owner = roles.find((role) => role.name === "OWNER");
      if (!owner || !title) throw new Error("Club roles or title could not be created.");
      await transaction.insert(clubMemberships).values({ userId: context.user.id, clubId, roleId: owner.id, titleId: title.id });
    });

    revalidatePath("/clubs");

    return { clubId, slug };
  },
);
