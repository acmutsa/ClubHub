import { and, eq, isNull } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";

import { Permission } from "@/constants/permissions";
import { db } from "@/db";
import { eventCategories, events } from "@/db/schema";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";

export async function listClubEvents(clubId: string) {
  const context = await requireAuthContext();
  if (!matchesClubRoute(context.club, clubId)) notFound();
  if (!context.hasPermission(Permission.EVENTS_VIEW)) forbidden();

  return db.query.events.findMany({
    where: and(eq(events.clubId, context.clubId), isNull(events.deletedAt)),
    with: { club: true, category: true, location: true, thumbnail: true },
  });
}

export async function listClubEventTypes(clubId: string) {
  const context = await requireAuthContext();
  if (!matchesClubRoute(context.club, clubId)) notFound();
  if (!context.hasPermission(Permission.EVENTS_VIEW) && !context.hasPermission(Permission.EVENTS_CREATE)) forbidden();
  return db.query.eventCategories.findMany({
    where: and(eq(eventCategories.clubId, context.clubId), isNull(eventCategories.deletedAt)),
  });
}

export async function listLocations(clubId: string) {
  const context = await requireAuthContext();
  if (!matchesClubRoute(context.club, clubId)) notFound();
  if (!context.hasPermission(Permission.EVENTS_CREATE)) forbidden();

  return db.query.locations.findMany();
}

export async function getClubEventById(clubId: string, eventId: string) {
  const context = await requireAuthContext();
  if (!matchesClubRoute(context.club, clubId)) notFound();
  if (!context.hasPermission(Permission.EVENTS_VIEW)) forbidden();

  return db.query.events.findFirst({
    where: and(eq(events.clubId, context.clubId), eq(events.id, eventId), isNull(events.deletedAt)),
    with: { club: true, category: true, location: true, thumbnail: true },
  });
}

export async function getVisibleClubEventById(clubId: string, eventId: string) {
  const context = await requireAuthContext();
  if (!matchesClubRoute(context.club, clubId)) notFound();
  return db.query.events.findFirst({
    where: and(eq(events.clubId, context.clubId), eq(events.id, eventId), isNull(events.deletedAt)),
    with: { club: true, category: true, location: true, thumbnail: true },
  });
}
