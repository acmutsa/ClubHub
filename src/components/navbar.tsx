import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "./sign-out-button";
import { redirect } from "next/navigation";
interface NavbarProps {
  clubName: string;
  clubId: number;
}

export default async function Navbar({ clubName, clubId }: NavbarProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const userType = "admin";
  return (
    <div className="min-h-16 bg-white">
      <div className="flex items-center justify-between p-2 border-b rounded-lg">
        <Link href="/">{clubName}</Link>
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-2">
          <Link href="/clubs">Clubs</Link>
          <Link href="/profile">Profile</Link>
          {userType === "admin" && <Link href={`/clubs/${clubId}/admin`}>Admin</Link>}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
