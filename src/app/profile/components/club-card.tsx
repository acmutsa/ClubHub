import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDateInTimeZone } from "@/lib/time-zone";
import { ProfileLeaveClubButton } from "./profile-leave-club-button";
import { formatRoleName } from "../lib/format-role-name";
import { CalendarDays, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProfileClubMembership } from "../queries";

// By id, not slug: /clubs/<slug> 404s on the root host
function getClubHref(clubId: string) {
  return `/clubs/${encodeURIComponent(clubId)}`;
}

export function ClubCard({ club, timeZone }: { club: ProfileClubMembership; timeZone: string }) {
  const isInactive = club.status === "inactive";

  return (
    <Card
      className={cn(
        "hover:border-foreground/20 gap-0 overflow-hidden py-0 transition-colors",
        isInactive && "bg-muted/40",
      )}
    >
      <CardContent className={cn("flex items-center gap-4 p-5", isInactive && "opacity-60 grayscale")}>
        <Avatar className="size-14">
          {club.logoUrl && <AvatarImage src={club.logoUrl} alt="" />}
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {club.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            <Link href={getClubHref(club.id)} className="hover:underline">
              {club.name}
            </Link>
          </h3>
          <p className="text-muted-foreground truncate text-sm">{club.description}</p>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 flex-wrap justify-between gap-3 border-t px-5 py-2.5 [.border-t]:pt-2.5">
        <dl
          className={cn(
            "text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]",
            isInactive && "opacity-60",
          )}
        >
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{isInactive ? "Membership" : "Role"}</dt>
            <Shield className="size-[15px]" aria-hidden />
            <dd className={cn("font-medium", isInactive ? "text-muted-foreground" : "text-foreground")}>
              {isInactive ? "Inactive" : formatRoleName(club.role)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Joined</dt>
            <CalendarDays className="size-[15px]" aria-hidden />
            <dd>Joined {formatDateInTimeZone(club.joinedAt, timeZone)}</dd>
          </div>
        </dl>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="bg-background h-10 sm:h-8">
            <Link href={getClubHref(club.id)}>View club</Link>
          </Button>
          <ProfileLeaveClubButton clubId={club.id} clubName={club.name} />
        </div>
      </CardFooter>
    </Card>
  );
}
