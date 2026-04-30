"use server";
import { db } from "@/db/index";
import { events } from "@/db/schema";
import { authAction } from "@/lib/safe-action";
import { eventInsertSchema } from "@/lib/validators/event";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import isClubAdmin from "@/lib/membership";
import { returnValidationErrors } from "next-safe-action";
import { getClubBySlug } from "@/lib/queries/club";

const createEventSchema = eventInsertSchema.safeExtend({
  slug: z.string().min(1, "Club ID is required"),
});

export const createEventAction = authAction
  .inputSchema(createEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = ctx;

    // Check if user is admin of the club
    if (!(await isClubAdmin(userId, parsedInput.slug))) {
      returnValidationErrors(z.null(), {
        _errors: ["You do not have permission to create events for this club"],
      });
    }

    try {
      const club = await getClubBySlug(parsedInput.slug);
      if (!club) {
        returnValidationErrors(z.null(), {
          _errors: ["Club not found"],
        });
        return;
      }

      const { slug, ...eventData } = parsedInput;
      const newEvent = await db
        .insert(events)
        .values({
          ...eventData,
          clubId: club.id,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      revalidatePath(`/clubs/${slug}/admin/events`);

      return { success: true, event: newEvent[0] };
    } catch (error) {
      console.error("Failed to create event:", error);
      returnValidationErrors(z.null(), {
        _errors: ["Failed to create event. Please try again."],
      });
    }
  });
