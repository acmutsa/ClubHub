import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClubBySlug } from "@/lib/queries/club";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ClubAdminSidebar } from "@/components/clubs/admin/sidebar";
import { unauthorized } from "next/navigation";
import { isClubAdmin, getMemberRoles, isClubOwner } from "@/lib/membership";
import { domain, baseURL } from "@/lib/url";

export default async function Layout({
  params,
  children,
}: Readonly<{
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}>) {
  const { slug } = await params;
  const clubURL = `http://${slug}.${domain}`;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }

  const user = session.user;

  const club = await getClubBySlug(slug);
  if (!club) {
    return redirect(`${baseURL}/clubs`);
  }

  const isClubAdminUser = await isClubAdmin(user.id, club.id);
  if (!isClubAdminUser) {
    return unauthorized();
  }
  
  const isOwner = await isClubOwner(user.id, club.id);

  return (
    <SidebarProvider>
      <ClubAdminSidebar club={club} isOwner={isOwner} className="relative" baseUrl={clubURL} />
      <SidebarInset>
        <main>
          {/* <SidebarTrigger /> */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
