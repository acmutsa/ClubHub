import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { Button } from "./ui/button";
import { UserIcon } from "lucide-react";
import SignOutButton from "./sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeSwitcher } from "./theme-switcher";
interface NavbarProps {
  clubName: string;
  clubId: string;
  userType: string;
  //we will need to retieve image/logo eventually
}

export default async function Navbar({
  clubName,
  clubId,
  userType,
}: NavbarProps) {
  await requireCurrentUser();

  return (
    <header className="h-16 bg-background border-b border-border">
      <div className="h-full flex items-center justify-between px-4">
        <Link href="/" className=" font-bold text-2xl">
          {clubName}
        </Link>

        <div className="h-full flex items-center gap-4">
          {userType === "admin" && (
            <Button variant="link" asChild>
              <Link className="font-semibold" href="/admin">
                Admin
              </Link>
            </Button>
          )}

          <Button variant="link" asChild>
            <Link className="font-semibold" href="/events">
              Events
            </Link>
          </Button>

          <Button variant="link" asChild>
            <Link className="font-semibold" href="/members">
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
                <ThemeSwitcher />
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
