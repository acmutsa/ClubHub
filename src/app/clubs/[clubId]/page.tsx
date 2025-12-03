
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
} from "@/components/ui/table"
import { db } from "@/db/index";
import { membership,clubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { joinClub,leaveClub } from "@/db/actions/clubs";

export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  const session = await auth.api.getSession({


    headers: await headers()


  });
  
  if (!session) {


    return <div>Unauthorized</div>;


  }
  const user = session.user.id;
  const allClubs = await db.select().from(clubs);
  const memberships = await db.select().from(membership).where(eq(membership.userId,user));
  const memberClubIds = new Set(memberships.map(m=>m.clubId));
  return(
          <>
          <div className="flex flex-row justify-between">
            <h1 className="text-4xl font-bold text-center mb-6">Your Clubs</h1>
            <SignOutButton/>
          </div>

            <div className="w-full flex justify-center">
              <div className="border rounded-xl overflow-hidden w-[80%] max-w-3xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead >Club</TableHead>
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
                            <form action={leaveClub.bind(null, user, club.id)}>
                              <Button variant="destructive">Leave Club</Button>
                            </form>
                          ) : (
                            <form action={joinClub.bind(null, user, club.id)}>
                              <Button variant="outline">Join Club</Button>
                            </form>
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
  
  ;
}
