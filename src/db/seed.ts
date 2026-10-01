import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

import { clubRoles, clubs, globalRoles } from "@/db/schema";
import { permission } from "@/config/constants";


const GLOBAL_ROLES = ["MEMBER", "ADMIN"];

const SYSTEM_CLUB_ROLES = [
  { name: "MEMBER", description: "Default role for club members", permissions: ["overview"], color: "#71717a" },
  { name: "ADMIN", description: "Full access to the club", permissions: [...permission], color: "#3b82f6" },
];

async function main() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });

  await db.insert(globalRoles).values(GLOBAL_ROLES.map((role) => ({ role }))).onConflictDoNothing();

  const existingClubs = await db.select({ id: clubs.id }).from(clubs);
  if (existingClubs.length > 0) {
    await db
      .insert(clubRoles)
      .values(existingClubs.flatMap((club) => SYSTEM_CLUB_ROLES.map((role) => ({ ...role, clubId: club.id, isSystem: true }))))
      .onConflictDoNothing();
  }
}

main();
