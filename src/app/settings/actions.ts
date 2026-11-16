"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { ActionErrorCode } from "@/constants/action-error-code";
import { db } from "@/db/index";
import { user } from "@/db/auth-schema";
import { userProfiles } from "@/db/schema";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { actionError } from "@/lib/actions/create-safe-action";
import { updateSettingsSchema } from "./validators";

export const updateSettingsAction = createAuthenticatedSafeAction(
  { schema: updateSettingsSchema },
  async (input, context) => {
    const userId = context.user.id;

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(userProfiles)
        .set(input)
        .where(and(eq(userProfiles.userId, userId), isNull(userProfiles.deletedAt)))
        .returning({ userId: userProfiles.userId });

      if (updated.length === 0) {
        throw actionError(ActionErrorCode.NOT_FOUND, "Finish registration before editing your settings.");
      }

      await tx
        .update(user)
        .set({ name: `${input.firstName} ${input.lastName}` })
        .where(eq(user.id, userId));
    });

    revalidatePath("/profile");
  },
);
