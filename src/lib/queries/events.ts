"use server";
import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import isClubAdmin from "@/lib/membership";
import { events } from "@/db/schema";
import { sql } from "drizzle-orm/sql";
import type { AdminEventRow } from "@/lib/types/event"
import { thumbnailStorage } from "@/lib/storage/thumbnails";

export async function getClubEvents(slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, slug))) {
    unauthorized();
  }
  const clubEvents = await db.query.events.findMany({
    where: (events, { eq }) => eq(events.slug, slug),
    with: {
      club: true,
      eventTypes: true,
      location: true,
      thumbnail: true,
    },
  });

  // Resolve thumbnail keys to presigned URLs
  const resolved = await Promise.all(
    clubEvents.map(async (event) => {
      if (event.thumbnail) {
        const presignedUrl = await thumbnailStorage.getThumbnailUrl(
          event.thumbnail.url,
        );
        return {
          ...event,
          thumbnail: { ...event.thumbnail, url: presignedUrl },
        };
      }
      return event;
    }),
  );

  return resolved;
}

export async function getClubEventTypes(slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, slug))) {
    unauthorized();
  }
  const eventTypes = await db.query.eventTypes.findMany({
    where: (eventTypes, { eq }) => eq(eventTypes.slug, slug),
  });
  return eventTypes;
}

export async function getAllLocations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const locations = await db.query.locations.findMany({
    with: {
      building: true,
    },
  });
  return locations;
}

export async function getClubEvent(slug: string, eventId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, slug))) {
    unauthorized();
  }
  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(eq(events.slug, slug), eq(events.id, eventId)),
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

  if (event?.thumbnail) {
    const presignedUrl = await thumbnailStorage.getThumbnailUrl(
      event.thumbnail.url,
    );
    return { ...event, thumbnail: { ...event.thumbnail, url: presignedUrl } };
  }

  return event;
}

/**
 * Get event for member view (does not require admin privileges)
 * Excludes hidden events from being fetched
 */
export async function getMemberEvent(slug: string, eventId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }

  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(
        eq(events.slug, slug),
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

  if (event?.thumbnail) {
    const presignedUrl = await thumbnailStorage.getThumbnailUrl(
      event.thumbnail.url,
    );
    return { ...event, thumbnail: { ...event.thumbnail, url: presignedUrl } };
  }

  return event;
}

export async function getAdminTotalEventCount(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const role = session.user.role;
  if (role !== "admin" && role !== "super_admin") {
    unauthorized();
  }

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(events);

  return result[0]?.count ?? 0;
}

export async function getAllEventsData(): Promise<AdminEventRow[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const role = session.user.role;
  if (role !== "admin" && role !== "super_admin") {
    unauthorized();
  }

  const rows = await db.query.events.findMany({
    with: {
      creator: true,
      updater: true,
    },
  });

  return rows.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,

    start: event.start,
    end: event.end,
    checkInStart: event.checkinStart,
    checkInEnd: event.checkinEnd,

    createdById: event.createdBy,
    createdByName: event.creator?.name ?? "Unknown",

    updatedById: event.updatedBy,
    updatedByName: event.updater?.name ?? "Unknown",

    location: event.locationId,
    eventTypeId: event.eventTypeId,
    points: event.points,
    hidden: event.hidden,
  }));
}