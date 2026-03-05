import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getClub, getClubBySlug } from "@/lib/queries/club";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import isClubAdmin from "@/lib/membership";
import { modifyBasePath } from "@/lib/routing/subdomain";
import { string } from "zod";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ clubId: string, slug: string }>;
}>) {
  const { clubId,slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;
  
  const userRole = await isClubAdmin(user.id, slug);
  if (!userRole) {
    return redirect("/clubs");
  }

  // const club = await getClub(clubId);
  // if (!club) {
  //   return redirect("/clubs");
  // }
const club = await getClubBySlug(slug);
   if (!club) {
     return redirect("/clubs");
   }
  const h = (await headers()).get("host") ?? "";
  const path = modifyBasePath(slug, h, "/");
   console.log(path);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        clubName={club.name}
        clubSlug={slug}
        userType={userRole ? "admin" : "member"}
        baseUrl={path}
      />
      <main className="flex-1">{children}</main>
      <Footer clubSlug={slug} clubName={club.name} />
    </div>
  );
}
