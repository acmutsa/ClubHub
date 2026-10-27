import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { eventPasses } from "@/db/schema";

export async function findEventPass(userId: string, eventId: string) {
  return (
    (await db.query.eventPasses.findFirst({
      where: and(
        eq(eventPasses.userId, userId),
        eq(eventPasses.eventId, eventId),
      ),
    })) ?? null
  )
}
