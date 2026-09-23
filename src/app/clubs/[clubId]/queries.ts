import { forbidden, notFound } from "next/navigation";

import { db } from "@/db/index";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";

async function requireClubMember(clubId: string) {
  const context = await requireAuthContext();

  if (!matchesClubRoute(context.club, clubId)) notFound();

  return context;
}

async function requireClubAdmin(clubId: string) {
  const context = await requireClubMember(clubId);
  const isClubAdmin =
    context.membership.role === "ADMIN" ||
    context.membership.role === "SUPER_ADMIN";

  if (!isClubAdmin) forbidden();

  return context;
}

export async function listClubEvents(clubId: string) {
  const context = await requireClubAdmin(clubId);

  return db.query.events.findMany({
    where: (events, { eq }) => eq(events.clubId, context.clubId),
    with: {
      club: true,
      eventTypes: true,
      location: true,
      thumbnail: true,
    },
  });
}

export async function listClubEventTypes(clubId: string) {
  const context = await requireClubAdmin(clubId);

  return db.query.eventTypes.findMany({
    where: (eventTypes, { eq }) => eq(eventTypes.clubId, context.clubId),
  });
}

export async function listLocations() {
  await requireAuthContext();

  return db.query.locations.findMany({
    with: {
      building: true,
    },
  });
}

export async function getClubEventById(clubId: string, eventId: number) {
  const context = await requireClubAdmin(clubId);

  return db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(eq(events.clubId, context.clubId), eq(events.id, eventId)),
    with: {
      club: true,
      eventTypes: true,
      location: {
        with: {
          building: true,
        },
      },
      thumbnail: true,
    },
  });
}

export async function getVisibleClubEventById(clubId: string, eventId: number) {
  const context = await requireClubMember(clubId);

  return db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(
        eq(events.clubId, context.clubId),
        eq(events.id, eventId),
        eq(events.hidden, false),
      ),
    with: {
      club: true,
      eventTypes: true,
      location: {
        with: {
          building: true,
        },
      },
      thumbnail: true,
    },
  });
}
