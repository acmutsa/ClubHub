import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProfileClubMembership } from "../queries";
import { EmptyClubs } from "./empty-clubs";
import { ClubCard } from "./club-card";

export function MyClubs({ clubs, timeZone }: { clubs: ProfileClubMembership[]; timeZone: string }) {
  return (
    <section aria-labelledby="my-clubs-heading" className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id="my-clubs-heading" className="text-2xl font-bold">
            My Clubs
          </h2>
          <Badge variant="secondary">{clubs.length}</Badge>
        </div>
        {clubs.length > 0 && (
          <Link href="/clubs" className="text-sm font-medium underline underline-offset-4">
            Browse clubs
          </Link>
        )}
      </div>

      {clubs.length === 0 ? (
        <EmptyClubs />
      ) : (
        <ul className="flex flex-col gap-4">
          {clubs.map((club) => (
            <li key={club.id}>
              <ClubCard club={club} timeZone={timeZone} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

