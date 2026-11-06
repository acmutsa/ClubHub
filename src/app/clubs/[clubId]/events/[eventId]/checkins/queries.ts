import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { checkIns } from "@/db/schema";

export async function findCheckIn(userId: string, eventId: string) {
  return (
    (await db.query.checkIns.findFirst({
      where: and(
        eq(checkIns.userId, userId),
        eq(checkIns.eventId, eventId),
      ),
    })) ?? null
  )
}
