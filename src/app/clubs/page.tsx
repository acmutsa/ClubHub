import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "@/components/sign-out-button";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db/index";
import { membership, clubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  JoinClubButton,
  LeaveClubButton,
} from "@/lib/shared/membership/buttons";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;
  const allClubs = await db.select().from(clubs);
  const memberships = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, user.id));
  const memberClubIds = new Set(memberships.map((m) => m.clubId));

  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold text-center mb-6">Your Clubs</h1>
        <SignOutButton />
      </div>

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
                      <LeaveClubButton userId={user.id} clubId={club.id} />
                    ) : (
                      <JoinClubButton userId={user.id} clubId={club.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
