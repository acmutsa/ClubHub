import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { db } from "@/db";
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
        eq(events.hidden, false)
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
  return event;
}
