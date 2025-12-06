"use server";

import { membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { z } from "zod";

export const leaveClub = authAction
  .inputSchema(
    z.object({
      userId: z.string(),
      clubId: z.number(),
    })
  )
  .bindArgsSchemas<[userId: z.ZodString, clubId: z.ZodNumber]>([
    z.string(),
    z.number(),
  ])
  .action(async ({ bindArgsParsedInputs: [userId, clubId] }) => {
    await db
      .delete(membership)
      .where(and(eq(membership.userId, userId), eq(membership.clubId, clubId)));
    revalidatePath("/clubs");
  });

export const joinClub = authAction
  .inputSchema(
    z.object({
      userId: z.string(),
      clubId: z.number(),
    })
  )
  .bindArgsSchemas<[userId: z.ZodString, clubId: z.ZodNumber]>([
    z.string(),
    z.number(),
  ])
  .action(async ({ bindArgsParsedInputs: [userId, clubId] }) => {
    await db.insert(membership).values({
      userId,
      clubId,
    });
    revalidatePath("/clubs");
  });
