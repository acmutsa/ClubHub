"use server";

import { and, eq, isNull } from "drizzle-orm";

import { ActionErrorCode } from "@/constants/action-error-code";
import { db } from "@/db";
import { Permission } from "@/constants/permissions";
import { actionError, createSafeAction } from "@/lib/actions/create-safe-action";
import { createCheckInSchema } from "@/lib/validators/check-in";
import { checkIns, events } from "@/db/schema";
import { findCheckIn } from "./queries";

export const createCheckInAction = createSafeAction({ schema: createCheckInSchema, permission: Permission.EVENTS_CHECK_IN },
  async ({ userId, eventId }, context) => {
    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        eq(events.clubId, context.clubId),
        isNull(events.deletedAt),
      ),
    });
    if (!event) {
      throw actionError(ActionErrorCode.NOT_FOUND, "Event not found.");
    }

    const now = new Date();

    if (now < event.checkinStartsAt) {
      throw actionError(ActionErrorCode.FORBIDDEN, "Check-in is not yet open.");
    }

    if (now > event.checkinEndsAt) {
      throw actionError(ActionErrorCode.FORBIDDEN, "Check-in has already closed.");
    }

    const [inserted] = await db
      .insert(checkIns)
      .values({
        clubId: context.clubId,
        eventId: event.id,
        userId,
        checkedInById: context.user.id,
      })
      .onConflictDoNothing()
      .returning();

    const checkin = inserted ?? (await findCheckIn(context.user.id, event.id));
    if (!checkin) {
      throw actionError(ActionErrorCode.SERVER_ERROR, "The check-in could not be recorded.");
    }

    return {
      id: checkin.id,
    };
  },
);
