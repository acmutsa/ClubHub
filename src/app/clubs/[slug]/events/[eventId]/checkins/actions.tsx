"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { checkins, events, membership } from "@/db/schema";
import { getClubBySlug } from "@/lib/queries/club";

type CheckinResult = {
  ok: boolean;
  message: string;
  checkedIn?: boolean;
  rating?: number;
  feedback?: string;
};

type CheckinPayload = {
  slug: string;
  eventId: number;
  rating?: number;
  feedback?: string;
};

function normalizeRating(value: number | undefined): number | null {
  if (value === undefined) return null;
  if (!Number.isInteger(value)) return null;
  if (value < 1 || value > 5) return null;
  return value;
}

function normalizeFeedback(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 400);
}

export async function createCheckinAction(
  payload: CheckinPayload,
): Promise<CheckinResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "You need to sign in before checking in.",
    };
  }

  if (!Number.isInteger(payload.eventId) || payload.eventId <= 0) {
    return {
      ok: false,
      message: "Invalid event.",
    };
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, payload.eventId),
  });

  if (!event) {
    return {
      ok: false,
      message: "Event not found.",
    };
  }

  const club = await getClubBySlug(payload.slug);
  if (!club || event.clubId !== club.id) {
    return {
      ok: false,
      message: "That event does not belong to this club.",
    };
  }

  const membershipRow = await db.query.membership.findFirst({
    where: and(
      eq(membership.userId, session.user.id),
      eq(membership.clubId, event.clubId),
    ),
  });

  if (!membershipRow) {
    return {
      ok: false,
      message: "You must be a member of this club to check in.",
    };
  }

  const now = new Date();
  const checkinStart = new Date(event.checkinStart);
  const checkinEnd = new Date(event.checkinEnd);

  if (now < checkinStart) {
    return {
      ok: false,
      message: "Check-in is not open yet.",
    };
  }

  if (now > checkinEnd) {
    return {
      ok: false,
      message: "Check-in has already closed.",
    };
  }

  const normalizedRating = normalizeRating(payload.rating);
  const normalizedFeedback = normalizeFeedback(payload.feedback);

  const existingCheckin = await db.query.checkins.findFirst({
    where: and(
      eq(checkins.eventId, payload.eventId),
      eq(checkins.membershipId, membershipRow.id),
    ),
  });

  if (existingCheckin) {
    await db
      .update(checkins)
      .set({
        rating: normalizedRating,
        feedback: normalizedFeedback,
        method: existingCheckin.method ?? "manual",
      })
      .where(eq(checkins.id, existingCheckin.id));

    revalidatePath(
      `/clubs/${payload.slug}/events/${payload.eventId}/checkins`,
    );

    return {
      ok: true,
      checkedIn: true,
      rating: normalizedRating ?? 0,
      feedback: normalizedFeedback ?? "",
      message: "You were already checked in. Your rating and feedback were updated.",
    };
  }

  await db.insert(checkins).values({
    eventId: payload.eventId,
    membershipId: membershipRow.id,
    rating: normalizedRating,
    feedback: normalizedFeedback,
    method: "manual",
  });

  revalidatePath(`/clubs/${payload.slug}/events/${payload.eventId}/checkins`);

  return {
    ok: true,
    checkedIn: true,
    rating: normalizedRating ?? 0,
    feedback: normalizedFeedback ?? "",
    message: "You have been checked in.",
  };
}