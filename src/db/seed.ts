import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/env";

import { clubRoles, clubs, globalRoles } from "@/db/schema";
import { ALL_PERMISSIONS } from "@/constants/permissions";
import { MEMBER_ROLE_POSITION, OWNER_ROLE_POSITION } from "@/constants/role-positions";


const GLOBAL_ROLES = ["USER", "ADMIN"];

const SYSTEM_CLUB_ROLES = [
  { name: "MEMBER", description: "Default role for club members", permissions: [], color: "#71717a", position: MEMBER_ROLE_POSITION },
  { name: "OWNER", description: "Full access to the club", permissions: ALL_PERMISSIONS, color: "#3b82f6", position: OWNER_ROLE_POSITION },
];

async function main() {
  const db = drizzle({
    connection: {
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
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
