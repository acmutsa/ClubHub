"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { ActionErrorCode } from "@/constants/action-error-code";
import { db } from "@/db";
import { eventPasses, events } from "@/db/schema";
import { actionError, createSafeAction } from "@/lib/actions/create-safe-action";
import { createEventPassSchema } from "@/lib/validators/event-pass";
import { Permission } from "@/constants/permissions";
import { findEventPass } from "./queries";
import { signEventPassToken } from "./lib/event-pass-token";

export const createEventPassAction = createSafeAction(
  { schema: createEventPassSchema, permission: Permission.EVENTS_VIEW },
  async ({ eventId }, context) => {
    if (!context.membership) {
      throw actionError(ActionErrorCode.FORBIDDEN, "You must be a member of this club to get an event pass.");
    }

    const event = await db.query.events.findFirst({ where: and(eq(events.id, eventId), eq(events.clubId, context.clubId)) });
    if (!event) {
      throw actionError(ActionErrorCode.NOT_FOUND, "Event not found.");
    }

    const passId = randomUUID();
    const rawToken = randomUUID();

    const [inserted] = await db
      .insert(eventPasses)
      .values({
        id: passId,
        token: rawToken,
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
