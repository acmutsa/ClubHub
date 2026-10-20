import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import SignOutButton from "@/components/sign-out-button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db/index";
import { clubMemberships, clubs, userProfiles } from "@/db/schema";
import {
  JoinClubButton,
  LeaveClubButton,
  CreateClubButton,
} from "./components/club-membership-actions";

export default async function Page() {
  const user = await requireCurrentUser();
  const [allClubs, userMemberships, profiles] = await Promise.all([
    db.select().from(clubs),
    db
      .select()
      .from(clubMemberships)
      .where(eq(clubMemberships.userId, user.id)),
    db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(
        and(
          eq(userProfiles.userId, user.id),
          isNull(userProfiles.deletedAt),
        ),
      )
      .limit(1),
  ]);
  const isRegistered = profiles.length > 0;
  const memberClubIds = new Set(userMemberships.map((m) => m.clubId));

  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold text-center mb-6">Club Directory</h1>
        <SignOutButton />
      </div>

      {!isRegistered && (
        <section className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Complete registration to join clubs</h2>
            <p className="text-sm text-muted-foreground">
              Browse the directory now, then continue registration whenever you&apos;re ready.
              Your progress is saved in this browser.
            </p>
          </div>
          <Button asChild>
            <Link href="/registration">Continue registration</Link>
          </Button>
        </section>
      )}

      <div className="w-full flex justify-center">
        <div className="border rounded-xl overflow-hidden w-[80%] max-w-3xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Leave/Join</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {allClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>{club.name}</TableCell>
                  <TableCell>{club.description}</TableCell>
                  <TableCell className="whitespace-nowrap w-0">
                    {memberClubIds.has(club.id) ? (

                      <LeaveClubButton clubId={club.id} />

                    ) : isRegistered ? (
                      <JoinClubButton clubId={club.id} />
                    ) : (
                      <Button asChild>
                        <Link href="/registration">Register to join</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {isRegistered && (
        <div className="fixed bottom-4 right-4">
          <CreateClubButton />
        </div>
      )}
    </>
  );
}
