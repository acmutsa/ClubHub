import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/current-user";
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


export default async function Navbar(){
   const user = await getCurrentUser();

  return (
    <header className="h-16 border-b border-border bg-blue-200">
      <div className="h-full flex items-center justify-between px-4">
        <div className="h-full flex items-center gap-4">
          <Link href="/" className="flex font-bold text-xl items-center">
            <Image
              src="/assets/logo.png"
              alt="ACM Logo"
              className="h-10 w-10 shrink-0 sm:h-10 sm:w-10 md:h-15 md:w-15"
              height={50}
              width={50}
            />
          </Link>
        </div>

        <div className="h-full flex items-center gap-4">
          {user?.role === "admin" && (
            <Button variant="link" asChild>
              <Link className="font-semibold" href="/admin">
                Admin
              </Link>
            </Button>
          )}
          {user && (
            <>
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
            </>
          )}

          {!user ? (
            <Button asChild>
              <Link className="transition hover:-translate-y-1 hover:shadow-xl" href="/sign-in"> Sign In</Link>
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
