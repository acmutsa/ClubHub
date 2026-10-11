import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  Pencil,
  Search,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ProfileLeaveClubButton } from "./components/profile-leave-club-button";
import { DeletedAccountSignOut } from "./deleted-account-sign-out";
import { getProfilePageData } from "./queries";

const CAMPUS_TIME_ZONE = "America/Chicago";
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// Role names are stored uppercase with underscores ("OWNER", "VICE_PRESIDENT").
// Shows them as sentence case: "Owner", "Vice president".
function formatRoleName(roleName: string) {
  const words = roleName.trim().toLowerCase().replace(/_+/g, " ").replace(/\s+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// For real moments in time (joined, member since): shown in campus time so the
// result doesn't depend on the server's timezone.
function formatInstant(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString("en-US", { timeZone: CAMPUS_TIME_ZONE, ...options });
}

// For calendar dates stored as a timestamp at UTC midnight (graduation).
// Formatting in campus time would shift 2027-05-01T00:00Z back to April 30.
function formatCalendarMonth(date: Date) {
  return date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short" });
}

function getYearOfStudy(expectedGraduationDate: Date, now: Date) {
  const yearsUntilGraduation = (expectedGraduationDate.getTime() - now.getTime()) / MS_PER_YEAR;

  if (yearsUntilGraduation < 0) return "Graduated";
  if (yearsUntilGraduation <= 1) return "Senior";
  if (yearsUntilGraduation <= 2) return "Junior";
  if (yearsUntilGraduation <= 3) return "Sophomore";
  return "Freshman";
}

// Links to a club's pages by its ID, not its slug. 
// so a slug in this position 404s.
function getClubHref(clubId: string) {
  return `/clubs/${encodeURIComponent(clubId)}`;
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-[18px] shrink-0" aria-hidden />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className={value ? "font-medium" : "text-muted-foreground font-medium"}>
          {value ?? "Not set"}
        </dd>
      </div>
    </div>
  );
}

function EmptyClubs() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-14 text-center">
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

export default async function ProfilePage() {
  const data = await getProfilePageData();

  // The session belongs to a soft-deleted account: sign it out
  if (!data) return <DeletedAccountSignOut />;

  const { profile, clubs: myClubs } = data;

  // null when the user hasn't finished registration (no profile row)
  const graduationDate = profile.expectedGraduationDate;
  const graduation = graduationDate
    ? `${formatCalendarMonth(graduationDate)} · ${getYearOfStudy(graduationDate, new Date())}`
    : null;
  const memberSince = formatInstant(profile.memberSince, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-foreground">Profile</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Profile sidebar */}
        <Card className="w-full lg:w-80 lg:shrink-0">
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-28">
                {profile.image && <AvatarImage src={profile.image} alt="" />}
                <AvatarFallback className="text-4xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="max-w-full min-w-0">
                <h1 className="text-2xl leading-tight font-bold">{profile.name}</h1>
                {/* null until the user finishes registration (no profile row yet) */}
                {profile.pronouns && (
                  <p className="text-muted-foreground text-sm">{profile.pronouns}</p>
                )}
                <p className="text-muted-foreground text-sm break-all">{profile.email}</p>
              </div>
              {/* TODO: enable once /settings exists */}
              <Button variant="outline" className="w-full" disabled>
                <Pencil />
                Edit profile
              </Button>
            </div>

            <Separator />

            <dl className="flex flex-col gap-4 text-sm">
              <Detail icon={GraduationCap} label="School" value={profile.school ?? null} />
              <Detail icon={BookOpen} label="Major" value={profile.major ?? null} />
              <Detail icon={CalendarDays} label="Expected graduation" value={graduation} />
              <Detail icon={Clock} label="Member since" value={memberSince} />
            </dl>
          </CardContent>
        </Card>

        {/* My Clubs */}
        <section aria-labelledby="my-clubs-heading" className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 id="my-clubs-heading" className="text-2xl font-bold">
                My Clubs
              </h2>
              <Badge variant="secondary">{myClubs.length}</Badge>
            </div>
            {myClubs.length > 0 && (
              <Link href="/clubs" className="text-sm font-medium underline underline-offset-4">
                Browse clubs
              </Link>
            )}
          </div>

          {myClubs.length === 0 ? (
            <EmptyClubs />
          ) : (
            <ul className="flex flex-col gap-4">
              {myClubs.map((club) => {
                const isInactive = club.status === "inactive";
                const joined = formatInstant(club.joinedAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <li key={club.id}>
                    <Card
                      className={cn(
                        "hover:border-foreground/20 gap-0 overflow-hidden py-0 transition-colors",
                        isInactive && "bg-muted/40",
                      )}
                    >
                      <CardContent
                        className={cn(
                          "flex items-center gap-4 p-5",
                          isInactive && "opacity-60 grayscale",
                        )}
                      >
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
                            <dd
                              className={cn(
                                "font-medium",
                                isInactive ? "text-muted-foreground" : "text-foreground",
                              )}
                            >
                              {isInactive ? "Inactive" : formatRoleName(club.role)}
                            </dd>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <dt className="sr-only">Joined</dt>
                            <CalendarDays className="size-[15px]" aria-hidden />
                            <dd>Joined {joined}</dd>
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
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
