import MemberDataTable from "@/components/clubs/admin/members-table";
import { getMembers } from "@/lib/queries/club";
import isClubAdmin from "@/lib/membership";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { memberColumns } from "@/components/clubs/admin/user-columns";

export default async function Page({
  params,
}: {
  params: { clubId: string };
}) {

  const { clubId } = await params;

  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    redirect("/login");
  }

  const user = sessionData.user;

  const isAdmin = await isClubAdmin(user.id, clubId);
  if (!isAdmin){
    return unauthorized();
  }

  const members = await getMembers(clubId);


  return (
    <div className="flex flex-col p-4">
      <MemberDataTable
        columns={memberColumns}
        data={members ?? []}
      />
    </div>
  );
}
