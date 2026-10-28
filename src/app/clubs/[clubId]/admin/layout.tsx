import { ClubAdminSidebar } from "./components/club-admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";
import { forbidden, notFound } from "next/navigation";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ clubId: string }>;
  children: React.ReactNode;
}) {
  const { clubId } = await params;
  const context = await requireAuthContext();

  if (!matchesClubRoute(context.club, clubId)) notFound();
  const isClubAdmin = context.permissions.length > 0;

  if (!isClubAdmin) forbidden();

  return (
    <SidebarProvider>
      <ClubAdminSidebar permissions={context.permissions} className="relative" />
      <SidebarInset>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
