import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import isClubAdmin from "@/lib/membership";
import { thumbnailStorage } from "@/lib/storage/thumbnails";

export async function getClubEvents(clubId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, clubId))) {
    unauthorized();
  }
  const clubEvents = await db.query.events.findMany({
    where: (events, { eq }) => eq(events.clubId, clubId),
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

export async function getClubEventTypes(clubId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, clubId))) {
    unauthorized();
  }
  const eventTypes = await db.query.eventTypes.findMany({
    where: (eventTypes, { eq }) => eq(eventTypes.clubId, clubId),
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

export async function getClubEvent(clubId: string, eventId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, clubId))) {
    unauthorized();
  }
  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(eq(events.clubId, clubId), eq(events.id, eventId)),
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
export async function getMemberEvent(clubId: string, eventId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }

  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) =>
      and(
        eq(events.clubId, clubId),
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
