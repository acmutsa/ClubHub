import type { Metadata } from "next";
import { headers } from "next/headers";
import { and, asc, eq, isNull } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/db/index";
import { clubMemberships, clubs } from "@/db/schema";
import { OrgCard, type OrgCardData } from "../_components/org-card";

export const metadata: Metadata = {
  title: "All Orgs · ClubHub",
};

function toOrgCard(club: typeof clubs.$inferSelect): OrgCardData {
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    logoUrl: null,
    // category is NOT NULL (defaults to "Other"), so there's always one badge
    types: [club.category],
  };
}

export default async function AllOrgsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // clubs are soft-deleted, so hide rows with deletedAt set
  const clubRows = await db
    .select()
    .from(clubs)
    .where(isNull(clubs.deletedAt))
    .orderBy(asc(clubs.name));
  const orgs = clubRows.map(toOrgCard);

  // Memberships only drive the Join/Leave buttons, so if that lookup fails
  // still render the org list.
  let memberClubIds: Set<string> | null = null;
  if (session) {
    try {
      const membershipRows = await db
        .select({ clubId: clubMemberships.clubId })
        .from(clubMemberships)
        .where(
          and(
            eq(clubMemberships.userId, session.user.id),
            isNull(clubMemberships.deletedAt),
          ),
        );
      memberClubIds = new Set(membershipRows.map((m) => m.clubId));
    } catch (err) {
      console.error("All Orgs: couldn't load memberships", err);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">All Orgs</h1>
        <p className="mt-2 text-muted-foreground">
          {orgs.length} student{" "}
          {orgs.length === 1 ? "organization" : "organizations"} on campus
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
