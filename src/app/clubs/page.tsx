import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
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
import { memberships, clubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  JoinClubButton,
  LeaveClubButton,
  CreateClubButton,
} from "./components/club-membership-actions";

export default async function Page() {
  const user = await requireCurrentUser();
  const allClubs = await db.select().from(clubs);
  const userMemberships = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id));
  const memberClubIds = new Set(userMemberships.map((m) => m.clubId));

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

                      <LeaveClubButton clubId={club.id} />

                    ) : (
                      <JoinClubButton clubId={club.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <CreateClubButton />
      </div>
    </>
  );
}
