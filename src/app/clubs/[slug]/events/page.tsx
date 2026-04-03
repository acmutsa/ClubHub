import Calendar from "@/components/clubs/calendars";
import { db } from "@/db/index";
import { clubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClubEvents } from "@/lib/queries/events";

interface EventsPageProps {
  params: {
    slug: string;
  };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { slug } = await params;

  // Find club by slug
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });

  if (!club) {
    return <div className="p-10">Club not found</div>;
  }

  // Fetch events for this club
  const events = await getClubEvents(club.id);

  return (
    <div className="p-10">
      <Calendar events={events}></Calendar>
    </div>
  );
}
