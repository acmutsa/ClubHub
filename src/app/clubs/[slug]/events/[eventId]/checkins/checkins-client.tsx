"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Star, Ticket } from "lucide-react";
import { createCheckinAction } from "./actions";

type CheckinStatus = "open" | "upcoming" | "closed";

type EventData = {
  id: number;
  title: string;
  description: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  points: number;
  imageUrl: string | null;
  checkinStatus: CheckinStatus;
};

type Props = {
  clubId: string;
  event: EventData;
  viewerSignedIn: boolean;
  viewerCanCheckIn: boolean;
  initialCheckedIn: boolean;
  initialRating: number;
  initialFeedback: string;
};

export default function CheckinsClient({
  clubId,
  event,
  viewerSignedIn,
  viewerCanCheckIn,
  initialCheckedIn,
  initialRating,
  initialFeedback,
}: Props) {
  const router = useRouter();

  const [rating, setRating] = useState(initialRating);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusConfig = {
    open: {
      label: checkedIn ? "Checked In" : "Check-In Open",
      className: checkedIn
        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
        : "border-blue-200 bg-blue-100 text-blue-700",
      description: checkedIn
        ? "You're all set for this event."
        : "Check-in is currently open for attendees.",
    },
    upcoming: {
      label: "Check-In Not Open Yet",
      className: "border-amber-200 bg-amber-100 text-amber-700",
      description: "Check-in has not opened yet.",
    },
    closed: {
      label: "Check-In Closed",
      className: "border-zinc-300 bg-zinc-200 text-zinc-700",
      description: "Check-in has ended for this event.",
    },
  }[event.checkinStatus];

  const canAttemptCheckin =
    viewerSignedIn &&
    viewerCanCheckIn &&
    event.checkinStatus === "open" &&
    !checkedIn;

  let buttonLabel = "Check In";
  if (!viewerSignedIn) buttonLabel = "Sign In Required";
  else if (!viewerCanCheckIn) buttonLabel = "Club Membership Required";
  else if (event.checkinStatus === "upcoming") buttonLabel = "Not Open Yet";
  else if (event.checkinStatus === "closed") buttonLabel = "Check-In Closed";
  else if (checkedIn) buttonLabel = "Checked In";
  else if (isPending) buttonLabel = "Checking In...";

  function handleCheckIn() {
    if (!canAttemptCheckin || isPending) return;

    setMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await createCheckinAction({
        clubId,
        eventId: event.id,
        rating,
        feedback,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setCheckedIn(true);
      setRating(result.rating ?? 0);
      setFeedback(result.feedback ?? "");
      setMessage(result.message);
      router.refresh();
    });
  }


  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">

          <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="p-6 sm:p-8">

              <div className="flex gap-6 items-start mb-6">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-50 h-50 object-cover rounded-xl border"
                  />
                )} 

                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-950">
                      {event.title}
                    </h1>

                    <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${statusConfig.className}`}>
                      {statusConfig.label}
                    </div>
                  </div>

                  <p className="text-zinc-600 max-w-2xl">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Date</p>
                  <p className="font-semibold text-zinc-900">
                    {event.dateLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Time</p>
                  <p className="font-semibold text-zinc-900">
                    {event.timeLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Location</p>
                  <p className="font-semibold text-zinc-900">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-950 mb-2">
              Check In
            </h2>

            <p className="text-sm text-zinc-600 mb-6">
              Confirm your attendance and leave feedback.
            </p>

            <div className="mb-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
              {statusConfig.description}
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = value <= rating;
                  return (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="transition hover:scale-105"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          active
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Leave feedback..."
                className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-400 outline-none"
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!canAttemptCheckin || isPending}
              className={`w-full h-12 rounded-xl font-semibold transition ${
                !canAttemptCheckin || isPending
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-zinc-950 text-white hover:bg-zinc-800"
              }`}
            >
              {buttonLabel}
            </button>

            {checkedIn && (
              <div className="mt-4 text-emerald-600 text-sm">
                You’re checked in.
              </div>
            )}

            {message && (
              <div className="mt-4 text-blue-600 text-sm">{message}</div>
            )}

            {errorMessage && (
              <div className="mt-4 text-red-600 text-sm">{errorMessage}</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}