import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import SignOutButton from "@/components/sign-out-button";
import { NavLink } from "./nav-link";
import { CreateOrgDialog } from "./create-org-dialog";

// Site-wide (non-club) navbar: Home · All Orgs · Create Org · Log In/Sign Up.
// Club subsites keep using src/components/navbar.tsx.
export default async function SiteNavbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="h-16 bg-background border-b border-border">
      <div className="h-full flex items-center justify-between px-4">
        <Link href="/" className="font-bold text-2xl">
          ClubHub
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/clubs">All Orgs</NavLink>
          {session ? (
            <CreateOrgDialog />
          ) : (
            <NavLink href="/sign-in">Create Org</NavLink>
          )}
          {session ? (
            <div className="w-auto">
              <SignOutButton />
            </div>
          ) : (
            <NavLink href="/sign-in">Log In/Sign Up</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
