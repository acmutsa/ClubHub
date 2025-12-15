import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClub } from "@/lib/club";
import isClubAdmin from "@/lib/membership";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClubAdminSidebar } from "@/components/clubs/admin/sidebar";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ clubId: string }>;
  children: React.ReactNode;
}) {
  const { clubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, clubId))) {
    return redirect("/clubs");
  }

  const club = await getClub(clubId);
  if (!club) {
    return redirect("/clubs");
  }

  return (
    <SidebarProvider>
      <ClubAdminSidebar club={club} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
