import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { UserIcon } from "lucide-react";
import SignOutButton from "./sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DropdownSwitcher } from "./ThemeSwitcher";
interface NavbarProps {
  clubName: string;
  clubSlug: string;
  userType: string;
  baseUrl: string;
  //we will need to retieve image/logo eventually
}

export default async function Navbar({
  clubName,
  clubSlug,
  userType,
  baseUrl,
}: NavbarProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <header className="h-16 bg-background border-b border-border">
      <div className="h-full flex items-center justify-between px-4">
        <Link href="/" className=" font-bold text-2xl">
          {clubName}
        </Link>

        <div className="h-full flex items-center gap-4">
          {userType === "admin" && (
            <Button variant="link" asChild>
              <Link className="font-semibold" href={`${baseUrl}/admin`}>
                Admin
              </Link>
            </Button>
          )}

          <Button variant="link" asChild>
            <Link className="font-semibold" href={`${baseUrl}/events`}>
              Events
            </Link>
          </Button>

          <Button variant="link" asChild>
            <Link className="font-semibold" href={`${baseUrl}/members`}>
              Members
            </Link>
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="h-full flex items-center cursor-pointer">
                <div className="flex items-center justify-center h-6 w-6">
                  <UserIcon className="h-4 w-4" />
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DropdownSwitcher />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SignOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
