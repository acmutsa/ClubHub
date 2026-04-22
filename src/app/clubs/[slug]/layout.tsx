import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getClubBySlug } from "@/lib/queries/club";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isInClub, getMemberRoles, isClubAdmin } from "@/lib/membership";
import { domain, baseURL } from "@/lib/url";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const clubURL = `http://${slug}.${domain}`

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(`${baseURL}/sign-in`);
  }

  const user = session.user;

  const club = await getClubBySlug(slug);
  if (!club) {
    return redirect(`${baseURL}/clubs`);
  }

  const inClub = await isInClub(user.id, club.id);
  if (!inClub) {
    return redirect("/clubs");
  }

  const isClubAdminUser = await isClubAdmin(user.id, club.id);

  const isGlobalAdmin = user.role === "admin" || user.role === "super_admin";

  const isAdmin = isGlobalAdmin || isClubAdminUser;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        clubName={club.name}
        clubSlug={slug}
        userType={isAdmin ? "admin" : "member"}
        baseUrl={clubURL}
      />
      <main className="flex-1">{children}</main>
      <Footer clubSlug={slug} clubName={club.name} />
    </div>
  );
}