"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { events } from "@/db/schema";
import { ActionErrorCode } from "@/lib/actions/action-error-code";
import { actionError, createSafeAction } from "@/lib/actions/create-safe-action";
import { createEventSchema } from "@/lib/validators/event";

export const createEventAction = createSafeAction(
  {
    schema: createEventSchema,
    permission: "events.create",
  },
  async (input, context) => {
    const isClubAdmin =
      context.membership.role === "ADMIN" ||
      context.membership.role === "SUPER_ADMIN";

    if (!isClubAdmin) {
      throw actionError(
        ActionErrorCode.FORBIDDEN,
        "You do not have permission to create events for this club.",
      );
    }

    const [createdEvent] = await db
      .insert(events)
      .values({
        ...input,
        clubId: context.clubId,
        createdBy: context.user.id,
        updatedBy: context.user.id,
      })
      .returning();

    if (!createdEvent) {
      throw actionError(
        ActionErrorCode.SERVER_ERROR,
        "The event could not be created.",
      );
    }

    revalidatePath(`/clubs/${context.clubId}/admin/events`);

    return { event: createdEvent };
  },
);
