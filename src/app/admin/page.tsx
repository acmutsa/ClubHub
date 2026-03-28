import AdminEventChart from "@/components/admin/dashboard/event-chart";
import AdminUserChart from "@/components/admin/dashboard/user-chart";
import AdminClubChart from "@/components/admin/dashboard/club-chart";
import { getAdminTotalEventCount } from "@/lib/queries/events";
import { getRolesCounts } from "@/lib/queries/user";
import { getAdminTotalClubCount } from "@/lib/queries/club";


export default async function AdminDashboardPage() {
  const userData = await getRolesCounts();
  const eventData = await getAdminTotalEventCount();
  const clubData = await getAdminTotalClubCount();

  return (
    <div className="flex flex-col md:flex-row justify-center md:gap-8 gap-2">
      <AdminUserChart data={userData}/>
      <AdminEventChart eventCount={eventData}/>
      <AdminClubChart clubCount={clubData}/>
    </div>
  );
}