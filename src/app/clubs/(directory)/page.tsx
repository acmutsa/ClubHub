import type { Metadata } from "next";
import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { clubs, membership } from "@/db/schema";
import { OrgCard, type OrgCardData } from "../_components/org-card";

export const metadata: Metadata = {
  title: "All Orgs · ClubHub",
};

// The clubs table currently has no logo or type columns. These optional
// fields let the card pick them up as soon as they're added to the schema
// (e.g. `logoUrl: text()` and `types: text({ mode: "json" }).$type<string[]>()`).
type ClubRow = typeof clubs.$inferSelect & {
  logoUrl?: string | null;
  types?: string[] | string | null;
};

function toOrgCard(club: ClubRow): OrgCardData {
  const rawTypes = club.types ?? [];
  const types = Array.isArray(rawTypes)
    ? rawTypes
    : rawTypes.split(",").map((t) => t.trim()).filter(Boolean);
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    logoUrl: club.logoUrl ?? null,
    types,
  };
}

export default async function AllOrgsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const rows: ClubRow[] = await db.select().from(clubs).orderBy(asc(clubs.name));
  const orgs = rows.map(toOrgCard);

  // Memberships only drive the Join/Leave buttons, so if that lookup fails
  // (e.g. the membership table is missing) still render the org list.
  let memberClubIds: Set<string> | null = null;
  if (session) {
    try {
      const rows = await db
        .select({ clubId: membership.clubId })
        .from(membership)
        .where(eq(membership.userId, session.user.id));
      memberClubIds = new Set(rows.map((m) => m.clubId));
    } catch (err) {
      console.error("All Orgs: couldn't load memberships", err);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">All Orgs</h1>
        <p className="mt-2 text-muted-foreground">
          {orgs.length} student {orgs.length === 1 ? "organization" : "organizations"} on campus
        </p>
      </header>

      {orgs.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No orgs yet. Be the first to create one.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              isMember={memberClubIds ? memberClubIds.has(org.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}