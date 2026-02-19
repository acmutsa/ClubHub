import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getClub } from "@/lib/queries/club";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import isClubAdmin from "@/lib/membership";
import { getBasePath } from "@/lib/routing/subdomain";
export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}>) {
  const { clubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;

  const userRole = await isClubAdmin(user.id, clubId);
  if (!userRole) {
    return redirect("/clubs");
  }

  const club = await getClub(clubId);
  if (!club) {
    return redirect("/clubs");
  }
  
  const h = await headers();
  const host = h.get("host") ?? "";

  const path =  getBasePath(host)? "" : `/clubs/${clubId}`;

 
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        clubName={club.name}
        clubId={clubId}
        userType={userRole ? "admin" : "member"}
        baseUrl={path}
      />
      <main className="flex-1">{children}</main>
      <Footer clubId={clubId} clubName={club.name} />
    </div>
  );
}
