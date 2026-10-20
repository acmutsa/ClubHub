import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";

import SignOutButton from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { clubMemberships, clubs, userProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  JoinClubButton,
  LeaveClubButton,
} from "@/app/clubs/components/club-membership-actions";

export default async function Home() {
  const user = await getCurrentUser();
  const [allClubs, profileRows, userMemberships] = await Promise.all([
    db
      .select({
        id: clubs.id,
        name: clubs.name,
        description: clubs.description,
        category: clubs.category,
      })
      .from(clubs)
      .where(isNull(clubs.deletedAt))
      .orderBy(clubs.name),
    user
      ? db
          .select({ userId: userProfiles.userId })
          .from(userProfiles)
          .where(
            and(
              eq(userProfiles.userId, user.id),
              isNull(userProfiles.deletedAt),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    user
      ? db
          .select({ clubId: clubMemberships.clubId })
          .from(clubMemberships)
          .where(eq(clubMemberships.userId, user.id))
      : Promise.resolve([]),
  ]);
  const isRegistered = profileRows.length > 0;
  const memberClubIds = new Set(userMemberships.map((membership) => membership.clubId));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 p-6 sm:p-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold">
          UTSA Clubs
        </Link>
        {user ? (
          <SignOutButton />
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in?callbackUrl=%2F">Sign in</Link>
          </Button>
        )}
      </header>

      <section className="rounded-2xl border bg-card p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Find your community
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Explore UTSA student clubs
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse clubs and find a group that matches your interests. You can
          explore anytime; complete your student registration when you&apos;re
          ready to join.
        </p>
      </section>

      {user && !isRegistered && (
        <section
          className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"
          aria-labelledby="registration-prompt-title"
        >
          <div>
            <h2 id="registration-prompt-title" className="font-semibold">
              Complete registration to join clubs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your club directory is available now. Finish registration to
              unlock joining; your progress is saved in this browser so you can
              come back later.
            </p>
          </div>
          <Button asChild>
            <Link href="/registration">Continue registration</Link>
          </Button>
        </section>
      )}

      <section aria-labelledby="club-directory-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="club-directory-heading" className="text-2xl font-semibold">
              Club directory
            </h2>
            <p className="text-sm text-muted-foreground">
              {allClubs.length} {allClubs.length === 1 ? "club" : "clubs"} to explore
            </p>
          </div>
          {user && isRegistered && (
            <Button asChild variant="outline">
              <Link href="/clubs">My clubs</Link>
            </Button>
          )}
        </div>

        {allClubs.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allClubs.map((club) => (
              <li key={club.id} className="flex flex-col rounded-xl border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {club.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{club.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {club.description}
                </p>
                <div className="mt-5">
                  {user && isRegistered ? (
                    memberClubIds.has(club.id) ? (
                      <LeaveClubButton clubId={club.id} />
                    ) : (
                      <JoinClubButton clubId={club.id} />
                    )
                  ) : (
                    <Button
                      asChild
                      variant={user ? "default" : "outline"}
                      className="w-full"
                    >
                      <Link
                        href={
                          user
                            ? "/registration"
                            : "/sign-in?callbackUrl=%2F"
                        }
                      >
                        {user ? "Register to join" : "Sign in to join"}
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No clubs are available yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
