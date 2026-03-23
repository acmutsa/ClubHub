import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import CheckinsClient from "./checkins-client";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function CheckinsPage({ params }: PageProps) {
  const { eventId } = await params;
  const numericEventId = Number(eventId);

  if (Number.isNaN(numericEventId)) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-950">
            Invalid event
          </h1>
          <p className="mt-2 text-zinc-600">That event ID is not valid.</p>
        </div>
      </main>
    );
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, numericEventId),
    with: {
      thumbnail: true,
      location: {
        with: {
          building: true,
        },
      },
    },
  });

  if (!event) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-950">
            Event not found
          </h1>
          <p className="mt-2 text-zinc-600">
            We couldn’t find that event.
          </p>
        </div>
      </main>
    );
  }

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const now = new Date();
  const checkinStart = new Date(event.checkinStart);
  const checkinEnd = new Date(event.checkinEnd);

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const locationLabel = event.location
    ? `${event.location.building?.code ? `${event.location.building.code} ` : ""}${event.location.roomNumber}`
    : "Location TBD";

  const checkinStatus =
    now < checkinStart ? "upcoming" : now > checkinEnd ? "closed" : "open";

  const imageUrl = event.thumbnail?.url
    ? event.thumbnail.url.startsWith("http")
      ? event.thumbnail.url
      : `/${event.thumbnail.url}`
    : null;

  return (
    <CheckinsClient
      event={{
        id: event.id,
        title: event.title,
        description: event.description,
        dateLabel: formattedDate,
        timeLabel: formattedTime,
        location: locationLabel,
        points: event.points,
        imageUrl,
        checkinStatus,
      }}
    />
  );
}