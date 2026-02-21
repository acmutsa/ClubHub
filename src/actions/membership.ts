"use server";

import { clubs, membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { z } from "zod";
import { randomUUID } from "crypto";

export const leaveClub = authAction
  .bindArgsSchemas<[clubId: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [clubId], ctx: { userId } }) => {
    await db
      .delete(membership)
      .where(and(eq(membership.userId, userId), eq(membership.clubId, clubId)));
    revalidatePath("/clubs");
  });

export const joinClub = authAction
  .bindArgsSchemas<[clubId: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [clubId], ctx: { userId } }) => {
    await db
      .insert(membership)
      .values({
        userId,
        clubId,
      })
      .onConflictDoNothing();
    revalidatePath("/clubs");
  });

export const createClub = authAction
  .bindArgsSchemas<
    [name: z.ZodString, description: z.ZodString]
  >([z.string().min(1, "Club Name Required"), z.string().min(1, "Description Required")])
  .action(
    async ({ bindArgsParsedInputs: [name, description], ctx: { userId } }) => {
      const clubId = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(clubs).values({
          id: clubId,
          name,
          description,
          owner: userId,
        });
        await tx.insert(membership).values({
          userId,
          clubId,
          role: "super_admin",
        });
      });
      revalidatePath("/clubs");
      return { clubId };
    },
  );
