import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

import { clubRoles, clubTitles, clubs } from "@/db/schema";
import { SYSTEM_CLUB_ROLES } from "@/constants/roles";

async function main() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });

  const existingClubs = await db.select({ id: clubs.id }).from(clubs);
  if (existingClubs.length > 0) {
    await db
      .insert(clubRoles)
      .values(existingClubs.flatMap((club) => SYSTEM_CLUB_ROLES.map((role) => ({ ...role, permissions: [...role.permissions], clubId: club.id }))))
      .onConflictDoNothing();
    await db.insert(clubTitles).values(existingClubs.map((club) => ({ clubId: club.id, name: "Member" }))).onConflictDoNothing();
  }
}

main();
