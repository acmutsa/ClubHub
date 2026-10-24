"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/index";
import { clubMemberships, clubRoles, clubs, clubTitles } from "@/db/schema";
import { actionError } from "@/lib/actions/create-safe-action";
import { ActionErrorCode } from "@/lib/actions/action-error-code";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";

// Every club gets these on creation. The schema treats MEMBER and OWNER as
// system roles (isSystem = true: can't be deleted or renamed).
const OWNER_ROLE = "OWNER";
const MEMBER_ROLE = "MEMBER";
const DEFAULT_TITLE = "Member";

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

    revalidatePath("/clubs");
  },
);

export const joinClubAction = createAuthenticatedSafeAction(
  { schema: clubMembershipSchema },
  async ({ clubId }, context) => {
    // A membership needs a role and a title from the same club.
    const [memberRole] = await db
      .select({ id: clubRoles.id })
      .from(clubRoles)
      .where(
        and(
          eq(clubRoles.clubId, clubId),
          eq(clubRoles.name, MEMBER_ROLE),
          eq(clubRoles.isSystem, true),
        ),
      )
      .limit(1);

    const [defaultTitle] = await db
      .select({ id: clubTitles.id })
      .from(clubTitles)
      .where(
        and(eq(clubTitles.clubId, clubId), eq(clubTitles.name, DEFAULT_TITLE)),
      )
      .limit(1);

    if (!memberRole || !defaultTitle) {
      throw actionError(
        ActionErrorCode.SERVER_ERROR,
        "This club isn't set up for new members yet.",
      );
    }

    await db
      .insert(clubMemberships)
      .values({
        userId: context.user.id,
        clubId,
        roleId: memberRole.id,
        titleId: defaultTitle.id,
      })
      .onConflictDoNothing();

    revalidatePath("/clubs");
  },
);

export const createClubAction = createAuthenticatedSafeAction(
  { schema: createClubSchema },
  async ({ name, description }, context) => {
    const clubId = randomUUID();
    const ownerRoleId = randomUUID();
    const memberRoleId = randomUUID();
    const titleId = randomUUID();

    const baseSlug = createClubSlug(name) || "club";
    const existingClub = await db.query.clubs.findFirst({
      where: eq(clubs.slug, baseSlug),
      columns: { id: true },
    });
    const slug = existingClub ? `${baseSlug}-${clubId.slice(0, 8)}` : baseSlug;

    // Order matters: the membership row references the role and title,
    // which reference the club.
    await db.transaction(async (tx) => {
      await tx.insert(clubs).values({
        id: clubId,
        name,
        description,
        createdById: context.user.id,
        slug,
      });

      await tx.insert(clubRoles).values([
        {
          id: ownerRoleId,
          clubId,
          name: OWNER_ROLE,
          // TODO: fill with the full permission list from @/constants/permissions
          permissions: [],
          position: 100,
          isSystem: true,
        },
        {
          id: memberRoleId,
          clubId,
          name: MEMBER_ROLE,
          permissions: [],
          position: 0,
          isSystem: true,
        },
      ]);

      await tx.insert(clubTitles).values({
        id: titleId,
        clubId,
        name: DEFAULT_TITLE,
      });

      await tx.insert(clubMemberships).values({
        userId: context.user.id,
        clubId,
        roleId: ownerRoleId,
        titleId,
      });
    });

    revalidatePath("/clubs");

    return { clubId, slug };
  },
);