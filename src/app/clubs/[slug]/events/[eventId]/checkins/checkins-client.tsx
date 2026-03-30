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
  slug: string;
  event: EventData;
  viewerSignedIn: boolean;
  viewerCanCheckIn: boolean;
  initialCheckedIn: boolean;
  initialRating: number;
  initialFeedback: string;
};

export default function CheckinsClient({
  slug,
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
        slug,
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
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-700">
                  <Ticket className="h-4 w-4" />
                  Event Check-In
                </div>

                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                    {event.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    {event.description}
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${statusConfig.className}`}
              >
                {statusConfig.label}
              </div>
            </div>

            {event.imageUrl ? (
              <div className="mb-6 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-[260px] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <CalendarDays className="h-4 w-4" />
                  Date
                </div>
                <p className="text-base font-semibold text-zinc-900">
                  {event.dateLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <Clock3 className="h-4 w-4" />
                  Time
                </div>
                <p className="text-base font-semibold text-zinc-900">
                  {event.timeLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:col-span-2">
                <div className="mb-2 text-sm font-medium text-zinc-500">
                  Location
                </div>
                <p className="text-base font-semibold text-zinc-900">
                  {event.location}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:col-span-2">
                <div className="mb-2 text-sm font-medium text-zinc-500">
                  Points
                </div>
                <p className="text-base font-semibold text-zinc-900">
                  {event.points} points
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">
                Check-In Status
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {statusConfig.description}
              </p>

              {!viewerSignedIn ? (
                <p className="mt-3 text-sm font-medium text-amber-700">
                  You need to sign in before checking in.
                </p>
              ) : null}

              {viewerSignedIn && !viewerCanCheckIn ? (
                <p className="mt-3 text-sm font-medium text-amber-700">
                  You need club membership before you can check in.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Complete Your Check-In
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Feedback is optional, but it helps improve future events.
              </p>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm leading-6 text-zinc-600">
                  By checking in, you confirm your attendance for this event.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-900">
                  Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = value <= rating;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-full p-1 transition hover:scale-105"
                        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            active
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-sm text-zinc-500">
                  {rating === 0
                    ? "No rating selected"
                    : `You selected ${rating} out of 5`}
                </p>
              </div>

              <div>
                <label
                  htmlFor="feedback"
                  className="mb-3 block text-sm font-semibold text-zinc-900"
                >
                  Feedback
                  <span className="ml-1 font-normal text-zinc-500">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value.slice(0, 400))}
                  placeholder="What did you think about the event?"
                  className="min-h-40 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
                />

                <div className="mt-2 text-right text-xs text-zinc-500">
                  {feedback.length} / 400
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckIn}
                disabled={!canAttemptCheckin || isPending}
                className={`inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${
                  !canAttemptCheckin || isPending
                    ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
                }`}
              >
                {buttonLabel}
              </button>

              {checkedIn ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  You’re checked in. Thanks for attending!
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  {message}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}