import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/db/index";
import { clubMemberships, clubs } from "@/db/schema";
import { OrgCard, type OrgCardData } from "../_components/org-card";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "All Orgs · ClubHub",
};

function toOrgCard(
  club: typeof clubs.$inferSelect,
): OrgCardData {
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    logoUrl: null,
    types: club.category ? [club.category] : [],
  };
}

export default async function AllOrgsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const rows = await db.select().from(clubs).orderBy(asc(clubs.name));
  const orgs = rows.map(toOrgCard);

  const memberClubIds = session
    ? new Set(
        (
          await db
            .select({ clubId: clubMemberships.clubId })
            .from(clubMemberships)
            .where(eq(clubMemberships.userId, session.user.id))
        ).map((m) => m.clubId),
      )
    : null;

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
