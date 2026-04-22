import { notFound } from "next/navigation";
import { getMemberEvent } from "@/lib/queries/events";
import { EventDetailView } from "@/components/clubs/events/event-detail-view";

interface EventDetailsPageProps {
  params: Promise<{ slug: string; eventId: string }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { slug, eventId } = await params;
  const eventIdNumber = parseInt(eventId, 10);

  if (isNaN(eventIdNumber)) {
    notFound();
  }

  const event = await getMemberEvent(slug, eventIdNumber);

  if (!event) {
    notFound();
  }

  return <EventDetailView event={event} />;
}
