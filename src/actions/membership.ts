"use server";

import { clubs, membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { z } from "zod";
import { randomUUID } from "crypto";
import { user as users } from "@/db/auth.schema";

export const leaveClub = authAction
  .bindArgsSchemas<[slug: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [slug], ctx: { userId } }) => {
    await db
      .delete(membership)
      .where(and(eq(membership.userId, userId), eq(membership.slug, slug)));
    revalidatePath("/clubs");
  });

export const joinClub = authAction
  .bindArgsSchemas<[slug: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [slug], ctx: { userId } }) => {
    await db
      .insert(membership)
      .values({
        userId,
        slug,
      })
      .onConflictDoNothing();
    revalidatePath("/clubs");
  });

export const createClub = authAction
  .bindArgsSchemas<
    [name: z.ZodString, description: z.ZodString, slug: z.ZodString,]
  >([z.string().min(1, "Club Name Required"), z.string().min(1, "Description Required"), z.string().min(1,"Club Slug Required")])
  .action(
    async ({ bindArgsParsedInputs: [name, description, slug], ctx: { userId } }) => {
      const clubId = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(clubs).values({
          id: clubId,
          name,
          description,
          owner: userId,
          slug: slug,
        });
        await tx.insert(membership).values({
          userId,
          slug,
          role: "super_admin",
        });
      });
      revalidatePath("/clubs");
      return { slug };
    },
  );

export const transferOwnership = authAction
  .bindArgsSchemas<
    [slug: z.ZodString, email: z.ZodString]
  >([z.string(), z.string().email()])
  .action(
    async ({ bindArgsParsedInputs: [slug, email], ctx: { userId } }) => {
      const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug));
      if (!club || club.owner !== userId)
        throw new Error("Error: Not authorized");

      const [newOwner] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (!newOwner) throw new Error("Error: User not found");

      const [member] = await db
        .select()
        .from(membership)
        .where(
          and(
            eq(membership.userId, newOwner.id),
            eq(membership.slug, slug),
          ),
        );
      if (!member) throw new Error("Error: User is not a member of this club");

      // Update club owner
      await db
        .update(clubs)
        .set({ owner: newOwner.id })
        .where(eq(clubs.slug, slug));

      // Change old owner to become meber
      await db
        .update(membership)
        .set({ role: "member" })
        .where(
          and(eq(membership.userId, userId), eq(membership.slug, slug)),
        );
      // Change the new owner to become super_admin
      await db
        .update(membership)
        .set({ role: "super_admin" })
        .where(
          and(
            eq(membership.userId, newOwner.id),
            eq(membership.slug, slug),
          ),
        );
    },
  );
