import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";

import { db } from "@/db/index";
import { clubMemberships, clubs } from "@/db/schema";
import type { AllOrgsFilters } from "./validators";

// Escape LIKE wildcards so searching "100%" or "a_b" matches literally.
function toContainsPattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

// Case-insensitive name ordering ("acm" and "ACM" sort together).
const nameNoCase = sql`${clubs.name} COLLATE NOCASE`;

export async function listOrgs(filters: AllOrgsFilters) {
  const conditions: SQL[] = [isNull(clubs.deletedAt)];

  if (filters.q) {
    // SQLite LIKE is case-insensitive for ASCII, which is what we want here.
    conditions.push(
      sql`${clubs.name} LIKE ${toContainsPattern(filters.q)} ESCAPE '\\'`,
    );
  }

  if (filters.type.length > 0) {
    // "one or more types" = the org matches ANY of the selected types
    conditions.push(inArray(clubs.category, filters.type));
  }

  const orderBy =
    filters.sort === "name-desc"
      ? [desc(nameNoCase)]
      : filters.sort === "type"
        ? [asc(clubs.category), asc(nameNoCase)]
        : [asc(nameNoCase)];

  return db
    .select({
      id: clubs.id,
      slug: clubs.slug,
      name: clubs.name,
      description: clubs.description,
      category: clubs.category,
      logoFileId: clubs.logoFileId,
    })
    .from(clubs)
    .where(and(...conditions))
    .orderBy(...orderBy);
}

// Total count without filters, so the header can say "3 of 40 orgs".
export async function getOrgCount() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clubs)
    .where(isNull(clubs.deletedAt));
  return row?.count ?? 0;
}

export async function listMemberClubIds(userId: string) {
  const rows = await db
    .select({ clubId: clubMemberships.clubId })
    .from(clubMemberships)
    .where(
      and(eq(clubMemberships.userId, userId), isNull(clubMemberships.deletedAt)),
    );
  return new Set(rows.map((row) => row.clubId));
}
