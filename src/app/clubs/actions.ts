"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/index";
import { clubs, memberships } from "@/db/schema";
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

export const leaveClubAction = createAuthenticatedSafeAction(
  { schema: clubMembershipSchema },
  async ({ clubId }, context) => {
    await db
      .delete(memberships)
      .where(
        and(
          eq(memberships.userId, context.user.id),
          eq(memberships.clubId, clubId),
        ),
      );

    revalidatePath("/clubs");
  },
);

export const joinClubAction = createAuthenticatedSafeAction(
  { schema: clubMembershipSchema },
  async ({ clubId }, context) => {
    await db
      .insert(memberships)
      .values({
        userId: context.user.id,
        clubId,
      })
      .onConflictDoNothing();

    revalidatePath("/clubs");
  },
);

export const createClubAction = createAuthenticatedSafeAction(
  { schema: createClubSchema },
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
        ownerId: context.user.id,
        slug,
      });
      await transaction.insert(memberships).values({
        userId: context.user.id,
        clubId,
        role: "SUPER_ADMIN",
      });
    });

    revalidatePath("/clubs");

    return { clubId, slug };
  },
);
