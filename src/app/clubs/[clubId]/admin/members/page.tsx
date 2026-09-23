import MemberDataTable from "./components/members-table";
import { memberColumns } from "./components/member-columns";
import { listClubMembers } from "./queries";

export default async function Page({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const members = await listClubMembers(clubId);

  return (
    <div className="flex flex-col p-4">
      <MemberDataTable columns={memberColumns} data={members} />
    </div>
  );
}
