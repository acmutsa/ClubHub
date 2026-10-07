"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  CalendarPlus,
  ChevronRight,
  Award,
  UserCheck,
} from "lucide-react";
import { google, outlook, office365, yahoo, ics } from "calendar-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AdminEvent } from "@/lib/types/event";

type EventDetailViewProps = { event: AdminEvent };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatTimeRange(startAt: Date, endAt: Date): string {
  return `${formatTime(startAt)} - ${formatTime(endAt)}`;
}

export function EventDetailView({ event }: EventDetailViewProps) {
  // Create calendar event object for the calendar-link library
  const calendarEvent = {
    title: event.title,
    description: event.description,
    start: event.startsAt,
    end: event.endsAt,
    location: event.location
      ? `${event.location.building}, ${event.location.roomName ?? event.location.roomNumber} (${event.location.code} ${event.location.roomNumber})`
      : undefined,
  };

  const handleAddToCalendar = (
    type: "google" | "outlook" | "office365" | "yahoo" | "ics"
  ) => {
    let url: string;
    switch (type) {
      case "google":
        url = google(calendarEvent);
        break;
      case "outlook":
        url = outlook(calendarEvent);
        break;
      case "office365":
        url = office365(calendarEvent);
        break;
      case "yahoo":
        url = yahoo(calendarEvent);
        break;
      case "ics":
        url = ics(calendarEvent);
        break;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            {event.club.name}
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href="/events"
            className="transition-colors hover:text-foreground"
          >
            Events
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">{event.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Event thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
              {event.thumbnail ? (
                <Image
                  src="/event-thumbnail-placeholder.svg"
                  alt={`Thumbnail preview for ${event.title}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Calendar className="size-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Event Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: `${event.category.color}15`,
                    color: event.category.color,
                    borderColor: `${event.category.color}40`,
                  }}
                >
                  {event.category.name}
                </Badge>
                {event.points > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Award className="size-3" />
                    {event.points} pts
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {event.title}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{formatDate(event.startsAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  <span>{formatTimeRange(event.startsAt, event.endsAt)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    <span>
                      {event.location.code} {event.location.roomNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">About this event</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </section>

            {/* Schedule */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Schedule</h2>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <UserCheck className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Check-in opens</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.checkinStartsAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">Event starts</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startsAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Event ends</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.endsAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="sticky top-6 space-y-6 self-start">
            {/* Event Info Card */}
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Date & Time Summary */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Calendar className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(event.startsAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Clock className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {formatTimeRange(event.startsAt, event.endsAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <MapPin className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      {event.location ? (
                        <p className="font-medium">
                          {event.location.building}, {event.location.roomName ?? event.location.roomNumber}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">TBA</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-2">
                        <CalendarPlus className="size-4" />
                        Add to Calendar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleAddToCalendar("google")}
                      >
                        Google Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddToCalendar("outlook")}
                      >
                        Outlook.com
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddToCalendar("office365")}
                      >
                        Office 365
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddToCalendar("yahoo")}
                      >
                        Yahoo Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddToCalendar("ics")}
                      >
                        Download .ics file
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon">
                    <Heart className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Host Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hosted by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {event.club.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{event.club.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
