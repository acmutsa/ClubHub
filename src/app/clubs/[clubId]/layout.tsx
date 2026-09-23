import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { requireAuthContext } from "@/lib/auth/get-auth-context";
import { matchesClubRoute } from "@/lib/club-context/get-club-context";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}>) {
  const { clubId } = await params;
  const context = await requireAuthContext();

  if (!matchesClubRoute(context.club, clubId)) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        clubName={context.club.name}
        clubId={clubId}
        userType={
          context.membership.role === "ADMIN" ||
          context.membership.role === "SUPER_ADMIN"
            ? "admin"
            : "member"
        }
      />
      <main className="flex-1">{children}</main>
      <Footer clubId={clubId} clubName={context.club.name} />
    </div>
  );
}
