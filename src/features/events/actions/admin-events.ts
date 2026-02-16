"use server";
import { db } from "@/db/index";
import { events } from "@/db/schema";
import { authAction } from "@/lib/safe-action";
import { eventInsertSchema } from "@/features/events/lib/validators/event";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import isClubAdmin from "@/lib/membership";
import { returnValidationErrors } from "next-safe-action";

const createEventSchema = eventInsertSchema.safeExtend({
  clubId: z.string().min(1, "Club ID is required"),
});

export const createEventAction = authAction
  .inputSchema(createEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = ctx;

    // Check if user is admin of the club
    if (!(await isClubAdmin(userId, parsedInput.clubId))) {
      returnValidationErrors(z.null(), {
        _errors: ["You do not have permission to create events for this club"],
      });
    }

    try {
      const newEvent = await db
        .insert(events)
        .values({
          ...parsedInput,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      revalidatePath(`/clubs/${parsedInput.clubId}/admin/events`);

      return { success: true, event: newEvent[0] };
    } catch (error) {
      console.error("Failed to create event:", error);
      returnValidationErrors(z.null(), {
        _errors: ["Failed to create event. Please try again."],
      });
    }
  });
