import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClub, getClubBySlug } from "@/lib/queries/club";
import isClubAdmin from "@/lib/membership";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ClubAdminSidebar } from "@/components/clubs/admin/sidebar";
import { unauthorized } from "next/navigation";
import { modifyBasePath } from "@/lib/routing/subdomain";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ clubId: string, slug: string }>;
  children: React.ReactNode;
}) {
  const { clubId, slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;
  if (!(await isClubAdmin(user.id, slug))) {
    return unauthorized();
  }

  // const club = await getClub(clubId);
  // if (!club) {
  //   return unauthorized();
  // }
    const club = await getClubBySlug(slug);
   if (!club) {
     return unauthorized();
   }
  const h = (await headers()).get("host") ?? "";
  const path = modifyBasePath(slug, h, "");

  return (
    <SidebarProvider>
      <ClubAdminSidebar club={club} className="relative" baseUrl={path} />
      <SidebarInset>
        <main>
          {/* <SidebarTrigger /> */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
