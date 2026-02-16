"use server";

import { clubs, membership } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { randomUUID } from "crypto";
import { db } from "@/db/index";
import { z } from "zod";

export const createClub = authAction
  .bindArgsSchemas<[name: z.ZodString, description: z.ZodString]>([
    z.string().min(1, "Club Name Required"),
    z.string().min(1, "Description Required"),
  ])
  .action(
    async ({ bindArgsParsedInputs: [name, description], ctx: { userId } }) => {
      const clubId = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(clubs).values({
          id: clubId,
          name,
          description,
        });
        await tx.insert(membership).values({
          userId,
          clubId,
          role: "super_admin",
        });
      });
      revalidatePath("/clubs");
      return { clubId };
    }
  );