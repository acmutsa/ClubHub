import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  JoinClubButton,
  LeaveClubButton,
} from "@/components/shared/membership/buttons";

export type OrgCardData = {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  types: string[];
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function OrgCard({
  org,
  isMember,
}: {
  org: OrgCardData;
  // undefined = signed out, so no join/leave action is shown
  isMember?: boolean;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card text-card-foreground p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar className="size-14 rounded-lg">
          {org.logoUrl && (
            <AvatarImage
              src={org.logoUrl}
              alt={`${org.name} logo`}
              className="object-cover"
            />
          )}
          <AvatarFallback className="rounded-lg text-lg font-semibold">
            {initials(org.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-lg leading-tight truncate">
            {org.name}
          </h2>
          {org.types.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Org types">
              {org.types.map((t) => (
                <li key={t}>
                  <Badge variant="secondary">{t}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
        {org.description}
      </p>

      {isMember !== undefined && (
        <div className="self-end">
          {isMember ? (
            <LeaveClubButton clubId={org.id} />
          ) : (
            <JoinClubButton clubId={org.id} />
          )}
        </div>
      )}
    </article>
  );
}
