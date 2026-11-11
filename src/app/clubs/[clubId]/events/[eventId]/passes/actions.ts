"use server";

import { and, eq, isNull } from "drizzle-orm";

import { ActionErrorCode } from "@/constants/action-error-code";
import { Permission } from "@/constants/permissions";
import { db } from "@/db";
import { eventPasses, events } from "@/db/schema";
import { actionError, createSafeAction, SafeActionError } from "@/lib/actions/create-safe-action";
import { createEventPassSchema, scanEventPassSchema } from "@/lib/validators/event-pass";
import { findEventPass, findEventPassByToken } from "./queries";
import { readEventPassToken, signEventPassToken } from "./lib/event-pass-token";
import { createCheckInAction } from "../checkins/actions";
import { getClubEventById } from "../../../queries";
import { findCheckIn } from "../checkins/queries";

export const createEventPassAction = createSafeAction(
  { schema: createEventPassSchema, permission: Permission.EVENTS_VIEW },
  async ({ eventId }, context) => {
    const event = await getClubEventById(context.clubId, eventId);
    if (!event) {
      throw actionError(ActionErrorCode.NOT_FOUND, "Event not found.");
    }

    const [inserted] = await db
      .insert(eventPasses)
      .values({
        userId: context.user.id,
        clubId: context.clubId,
        eventId: event.id,
        expiryDate: event.checkinEndsAt,
      })
      .onConflictDoNothing()
      .returning();

    const pass = inserted ?? (await findEventPass(context.user.id, event.id));
    if (!pass) {
      throw actionError(ActionErrorCode.SERVER_ERROR, "The event pass could not be created.");
    }

    return {
      eventId: pass.eventId,
      token: signEventPassToken(pass.token),
      expiryDate: pass.expiryDate,
      used: pass.usedAt !== null,
    };
  },
);

export const scanEventPassAction = createSafeAction(
  { schema: scanEventPassSchema, permission: Permission.EVENTS_CHECK_IN },
  async ({ eventId, token }, context) => {
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

    const rawToken = readEventPassToken(token);
    const pass = rawToken ? await findEventPassByToken(context.clubId, rawToken) : null;
    if (!pass) {
      throw actionError(ActionErrorCode.NOT_FOUND, "This event pass is not valid.");
    }

    if (pass.eventId !== event.id) {
      throw actionError(ActionErrorCode.FORBIDDEN, "This event pass is for a different event.");
    }

    if (pass.usedAt || (await findCheckIn(pass.userId, event.id))) {
      throw actionError(ActionErrorCode.CONFLICT, "This member is already checked in.");
    }

    const result = await createCheckInAction({
      userId: pass.userId,
      eventId: event.id,
    });
    if (!result.ok) {
      // This must be done this way to preserve the error code.
      throw actionError(
        result.error.code as ConstructorParameters<typeof SafeActionError>[0],
        result.error.message,
        result.error.fieldErrors,
      );
    }

    const [used] = await db
      .update(eventPasses)
      .set({
        usedAt: new Date(),
        checkInId: result.data.id,
      })
      .where(
        and(
          eq(eventPasses.id, pass.id),
          isNull(eventPasses.usedAt)
        ),
      )
      .returning({ id: eventPasses.id });
    if (!used) {
      throw actionError(ActionErrorCode.CONFLICT, "This member is already checked in.");
    }

    return {
      checkInId: result.data.id,
    };
  },
);

