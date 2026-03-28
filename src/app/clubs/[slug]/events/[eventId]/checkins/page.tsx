import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { checkins, clubs, events, membership } from "@/db/schema";
import CheckinsClient from "./checkins-client";

type PageProps = {
  params: Promise<{
    slug: string;
    eventId: string;
  }>;
};

export default async function CheckinsPage({ params }: PageProps) {
  const { slug, eventId } = await params;
  const numericEventId = Number(eventId);

  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    notFound();
  }

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });

  if (!club) {
    notFound();
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

  if (!event || event.clubId !== club.id) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let viewerSignedIn = false;
  let viewerCanCheckIn = false;
  let initialCheckedIn = false;
  let initialRating = 0;
  let initialFeedback = "";

  if (session?.user?.id) {
    viewerSignedIn = true;

    const membershipRow = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, session.user.id),
        eq(membership.clubId, club.id),
      ),
    });

    if (membershipRow) {
      viewerCanCheckIn = true;

      const existingCheckin = await db.query.checkins.findFirst({
        where: and(
          eq(checkins.eventId, event.id),
          eq(checkins.membershipId, membershipRow.id),
        ),
      });

      if (existingCheckin) {
        initialCheckedIn = true;
        initialRating = existingCheckin.rating ?? 0;
        initialFeedback = existingCheckin.feedback ?? "";
      }
    }
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
      : `/${event.thumbnail.url.replace(/^\/+/, "")}`
    : null;

  return (
    <CheckinsClient
      clubId={club.id}
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
      viewerSignedIn={viewerSignedIn}
      viewerCanCheckIn={viewerCanCheckIn}
      initialCheckedIn={initialCheckedIn}
      initialRating={initialRating}
      initialFeedback={initialFeedback}
    />
  );
}