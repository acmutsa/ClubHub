import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import isClubAdmin from "@/lib/membership";

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
  return clubEvents;
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
