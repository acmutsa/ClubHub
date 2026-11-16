import Link from "next/link";
import { Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyClubs() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl px-6 py-14 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <Users className="text-muted-foreground size-7" aria-hidden />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-lg font-semibold">You&apos;re not in any clubs yet</h3>
        <p className="text-muted-foreground text-sm">
          When you join a club, it shows up here with your role and the date you joined.
        </p>
      </div>
      <Button asChild>
        <Link href="/clubs">
          <Search />
          Browse clubs
        </Link>
      </Button>
    </div>
  );
}
