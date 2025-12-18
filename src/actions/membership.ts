"use server";

import { membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { z } from "zod";

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
