import { db } from "@/db/index";
import { membership,user,clubs } from "@/db/schema";
import { eq, inArray} from "drizzle-orm";
import { RemoveMemberButton } from "./RemoveMemberButton";

async function fetchClubMembers(clubId: string) {
  const club = await db.select().from(membership).where(eq(membership.clubId, Number(clubId)));
  const memberIds = club.map((m) => m.userId).filter((id): id is string => id !== null);
  if (memberIds.length === 0) {
    return [];
  }
  const members = await db.select().from(user).where(inArray(user.id, memberIds));
  return members;
}

export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  const clubData = await db
    .select()
    .from(clubs)
    .where(eq(clubs.id, Number(clubId)))
    .then(r => r[0]);

  const members = await fetchClubMembers(clubId);
  return (
      <>
        <div>Club {clubData.name}</div>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.name}
              <RemoveMemberButton userId={member.id} clubId={Number(clubId)} />
            </li>
          ))}
        </ul>
      </>
  );
}
