"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { events } from "@/db/schema";
import { eventCategories, subOrgs } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Permission } from "@/constants/permissions";
import { ActionErrorCode } from "@/lib/actions/action-error-code";
import { actionError, createSafeAction } from "@/lib/actions/create-safe-action";
import { insertEventFormSchema } from "@/lib/validators/event";

export const createEventAction = createSafeAction(
  {
    schema: insertEventFormSchema,
    permission: Permission.EVENTS_CREATE,
  },
  async (input, context) => {
    const category = await db.query.eventCategories.findFirst({ where: and(eq(eventCategories.id, input.categoryId), eq(eventCategories.clubId, context.clubId), isNull(eventCategories.deletedAt)) });
    if (!category) throw actionError(ActionErrorCode.FORBIDDEN, "Select a category in this club.", { categoryId: ["Select a category in this club."] });
    if (input.subOrgId) {
      const subOrg = await db.query.subOrgs.findFirst({ where: and(eq(subOrgs.id, input.subOrgId), eq(subOrgs.clubId, context.clubId), isNull(subOrgs.deletedAt)) });
      if (!subOrg) throw actionError(ActionErrorCode.FORBIDDEN, "Select a sub-organization in this club.", { subOrgId: ["Select a sub-organization in this club."] });
    }

    const [createdEvent] = await db
      .insert(events)
      .values({
        ...input,
        clubId: context.clubId,
        createdById: context.user.id,
        updatedById: context.user.id,
      })
      .returning();

    if (!createdEvent) {
      throw actionError(
        ActionErrorCode.SERVER_ERROR,
        "The event could not be created.",
      );
    }

    revalidatePath(`/clubs/${context.clubId}/admin/events`);
    revalidatePath(`/clubs/${context.club.slug}/admin/events`);

    return { event: createdEvent };
  },
);
