"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { user } from "@/db/auth-schema";
import { userProfiles } from "@/db/schema";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { updateSettingsSchema } from "./validators";

type UpdateSettingsResult = { status: "saved" } | { status: "no_profile" };

export const updateSettingsAction = createAuthenticatedSafeAction(
  { schema: updateSettingsSchema },
  async (input, context): Promise<UpdateSettingsResult> => {
    const userId = context.user.id;

    const result = await db.transaction(async (tx): Promise<UpdateSettingsResult> => {
      const updated = await tx
        .update(userProfiles)
        .set(input)
        .where(and(eq(userProfiles.userId, userId), isNull(userProfiles.deletedAt)))
        .returning({ userId: userProfiles.userId });

      if (updated.length === 0) return { status: "no_profile" };
      await tx
        .update(user)
        .set({ name: `${input.firstName} ${input.lastName}` })
        .where(eq(user.id, userId));

      return { status: "saved" };
    });

    if (result.status === "saved") {
      revalidatePath("/settings");
      revalidatePath("/profile");
    }
    return result;
  },
);
