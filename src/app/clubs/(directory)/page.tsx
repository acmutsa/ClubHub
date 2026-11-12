import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";
import { OrgCard, type OrgCardData } from "../_components/org-card";
import { OrgFilters } from "./components/org-filters";
import { getOrgCount, listMemberClubIds, listOrgs } from "./queries";
import { allOrgsFiltersSchema } from "./validators";

export const metadata: Metadata = {
  title: "All Orgs · ClubHub",
};

type OrgRow = Awaited<ReturnType<typeof listOrgs>>[number];

function toOrgCard(club: OrgRow): OrgCardData {
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    // TODO: resolve logoFileId to a URL once file storage exposes one
    logoUrl: null,
    // category is NOT NULL (defaults to "Other"), so there's always one badge
    types: [club.category],
  };
}

export default async function AllOrgsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = allOrgsFiltersSchema.parse(await searchParams);
  const session = await auth.api.getSession({ headers: await headers() });

  const [clubRows, totalCount] = await Promise.all([
    listOrgs(filters),
    getOrgCount(),
  ]);
  const orgs = clubRows.map(toOrgCard);

  // Memberships only drive the Join/Leave buttons, so if that lookup fails
  // still render the org list.
  let memberClubIds: Set<string> | null = null;
  if (session) {
    try {
      memberClubIds = await listMemberClubIds(session.user.id);
    } catch (err) {
      console.error("All Orgs: couldn't load memberships", err);
    }
  }

  const isFiltered = filters.q !== "" || filters.type.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-4xl font-bold">All Orgs</h1>
        <p className="mt-2 text-muted-foreground" aria-live="polite">
          {isFiltered
            ? `Showing ${orgs.length} of ${totalCount} organizations`
            : `${totalCount} student ${totalCount === 1 ? "organization" : "organizations"} on campus`}
        </p>
      </header>

      {totalCount === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No orgs yet. Be the first to create one.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <OrgFilters filters={filters} />
          </div>

          {orgs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <h2 className="font-medium">No orgs match your filters</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different name or remove a type filter.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/clubs">Clear filters</Link>
              </Button>
            </div>
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
        </>
      )}
    </div>
  );
}
