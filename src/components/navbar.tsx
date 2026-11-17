import Link from "next/link";
import { getPlatformContext } from "@/lib/platform-context/get-platform-context";
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
   const platformContext = await getPlatformContext();
   const user = platformContext?.user ?? null;
   const isAdmin = platformContext?.isAdmin ?? false;

  return (
    <header className="h-16 border-b border-border bg-background">
      <div className="h-full flex items-center justify-between px-4">
        <div className="h-full flex items-center font-bold gap-4">
          <Link href="/">
          ClubHub
          </Link>   
        </div>
        <div className="h-full flex items-center gap-4">
          {isAdmin && (
            <Button variant="link" asChild>
              <Link className="font-semibold" href="/admin">
                Admin
              </Link>
            </Button>
          )}
          {user && (
            <>
              <Button variant="link" asChild>
                <Link className="font-semibold" href="https://acmutsa.org/events">
                  Events
                </Link>
              </Button>

              <Button variant="link" asChild>
                <Link className="font-semibold" href="https://rowdylink.utsa.edu/organization/acm/roster">
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
