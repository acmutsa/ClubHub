import { notFound } from "next/navigation";
import { getVisibleClubEventById } from "../../queries";
import { EventDetailView } from "./components/event-detail-view";

interface EventDetailsPageProps {
  params: Promise<{ clubId: string; eventId: string }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { clubId, eventId } = await params;
  const eventIdNumber = parseInt(eventId, 10);

  if (isNaN(eventIdNumber)) {
    notFound();
  }

  const event = await getVisibleClubEventById(clubId, eventIdNumber);

  if (!event) {
    notFound();
  }

  return <EventDetailView event={event} />;
}
