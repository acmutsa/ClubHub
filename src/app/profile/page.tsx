import Link from "next/link";
import { BookOpen, CalendarDays, ChevronRight, Clock, GraduationCap, Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCalendarMonth } from "@/lib/format-calendar-month";
import { formatDateInTimeZone, getTimeZone } from "@/lib/time-zone";
import { Detail } from "./components/detail";
import { MyClubs } from "./components/my-clubs";
import { getYearOfStudy } from "./lib/get-year-of-study";
import { getCurrentUserClubMemberships, getCurrentUserProfile } from "./queries";

export default async function ProfilePage() {
  const [profile, myClubs, timeZone] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentUserClubMemberships(),
    getTimeZone(),
  ]);

  const graduationDate = profile.expectedGraduationDate;
  const graduation = graduationDate
    ? `${formatCalendarMonth(graduationDate)} · ${getYearOfStudy(graduationDate, new Date())}`
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-foreground">Profile</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
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
                {profile.pronouns && <p className="text-muted-foreground text-sm">{profile.pronouns}</p>}
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
              <Detail
                icon={Clock}
                label="Member since"
                value={formatDateInTimeZone(profile.memberSince, timeZone)}
              />
            </dl>
          </CardContent>
        </Card>

        <MyClubs clubs={myClubs} timeZone={timeZone} />
      </div>
    </main>
  );
}
