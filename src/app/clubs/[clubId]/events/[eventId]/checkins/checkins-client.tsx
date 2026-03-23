"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Star, Ticket } from "lucide-react";

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
  event: EventData;
};

export default function CheckinsClient({ event }: Props) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  async function handleCheckIn() {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setCheckedIn(true);
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const buttonDisabled =
    isSubmitting || checkedIn || event.checkinStatus !== "open";

  const buttonLabel = checkedIn
    ? "Checked In"
    : event.checkinStatus === "upcoming"
      ? "Not Open Yet"
      : event.checkinStatus === "closed"
        ? "Check-In Closed"
        : isSubmitting
          ? "Checking In..."
          : "Check In";

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

              <button
                type="button"
                onClick={handleCheckIn}
                disabled={buttonDisabled}
                className={`inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${
                  buttonDisabled
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}