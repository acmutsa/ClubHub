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
