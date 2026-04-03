"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { getMemberEvents } from "@/lib/queries/events";
import { format, isSameMonth, isSameYear } from "date-fns";
type ClubEventWithRelations = Awaited<
  ReturnType<typeof getMemberEvents>
>[number];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PX_PER_HOUR = 40;
const MAX_GRID_HEIGHT = 320;
const MIN_EVENT_MINUTES = 20;

const PX_PER_MIN = PX_PER_HOUR / 60;

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

function formatTimeRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

const PALETTE = [
  {
    bg: "bg-violet-500/15 hover:bg-violet-500/25 border-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-sky-500/15 hover:bg-sky-500/25 border-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  {
    bg: "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-500/15 hover:bg-rose-500/25 border-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
];

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  clubName?: string | null;
}

function EventBlock({
  event,
  colorIdx,
  onClick,
}: {
  event: CalendarEvent;
  colorIdx: number;
  onClick: (e: CalendarEvent) => void;
}) {
  const color = PALETTE[colorIdx % PALETTE.length];
  const startMins =
    event.startTime.getHours() * 60 + event.startTime.getMinutes();
  const endMins = event.endTime.getHours() * 60 + event.endTime.getMinutes();
  const duration = Math.max(endMins - startMins, MIN_EVENT_MINUTES);
  const top = startMins * PX_PER_MIN;
  const height = duration * PX_PER_MIN;

  return (
    <button
      onClick={() => onClick(event)}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={cn(
        "absolute left-px right-px rounded border-l-2 px-1 py-0.5 text-left",
        "transition-all duration-150 cursor-pointer overflow-hidden",
        color.bg,
        color.text,
      )}
    >
      <p className="text-[10px] font-semibold truncate leading-tight">
        {event.title}
      </p>
    </button>
  );
}

function EventDetailModal({
  event,
  colorIdx,
  onClose,
}: {
  event: CalendarEvent | null;
  colorIdx: number;
  onClose: () => void;
}) {
  if (!event) return null;
  const color = PALETTE[colorIdx % PALETTE.length];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <span
            className={cn("mt-1 h-3 w-3 rounded-full shrink-0", color.dot)}
          />
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {event.title}
            </h3>
            {event.clubName && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {event.clubName}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>
              {event.startTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        <Button className="mt-5 w-full" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

interface CalendarProps {
  events: ClubEventWithRelations[];
}

export default function Calendar({ events: rawEvents }: CalendarProps) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date()),
  );
  const [view, setView] = useState<"week" | "month" | "day">("week"); // added day
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // selected date state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const events: CalendarEvent[] = useMemo(
    () =>
      rawEvents.map((e) => ({
        id: String(e.id),
        title: e.title,
        startTime: e.start,
        endTime: e.end,
        location: e.location?.name ?? null,
        clubName: e.club?.name ?? null,
      })),
    [rawEvents],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const today = new Date();

  const eventsByDay = useMemo(() => {
    const map: Record<number, { event: CalendarEvent; colorIdx: number }[]> =
      {};
    events.forEach((event, idx) => {
      weekDays.forEach((day, dayIdx) => {
        if (isSameDay(event.startTime, day)) {
          if (!map[dayIdx]) map[dayIdx] = [];
          map[dayIdx].push({ event, colorIdx: idx });
        }
      });
    });
    return map;
  }, [events, weekDays]);

  // eventsByDay for DayView
  const eventsByDate = useMemo(() => {
    const map: Record<string, { event: CalendarEvent; colorIdx: number }[]> =
      {};
    events.forEach((event, idx) => {
      const key = event.startTime.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push({ event, colorIdx: idx });
    });
    return map;
  }, [events]);

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    const now = new Date();

    if (isSameMonth(weekStart, end)) {
      const startStr = format(weekStart, "MMMM d");
      const endStr = format(end, "d");
      const yearStr = isSameYear(weekStart, now) ? "" : `, ${format(weekStart, "yyyy")}`;
      return `${startStr} – ${endStr}${yearStr}`;
    } else {
      const startStr = format(weekStart, "MMMM d");
      const endStr = format(end, "MMMM d");
      const yearStr = (isSameYear(weekStart, now) && isSameYear(end, now)) ? "" : `, ${format(end, "yyyy")}`;
      return `${startStr} – ${endStr}${yearStr}`;
    }
  }, [weekStart]);

  const goToToday = () => setWeekStart(getWeekStart(new Date()));
  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  // Scroll to 8 AM on mount
  useEffect(() => {
    const el = document.getElementById("calendar-scroll");
    if (el) el.scrollTop = 8 * PX_PER_HOUR;
  }, []);

  // Weekview component
  interface WeekViewProps {
    weekStart: Date;
    events: CalendarEvent[];
    eventsByDay: Record<number, { event: CalendarEvent; colorIdx: number }[]>;
    onSelectEvent: (event: CalendarEvent, colorIdx: number) => void;
  }

  function WeekView({
    weekStart,
    events,
    eventsByDay,
    onSelectEvent,
  }: WeekViewProps) {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();

    return (
      <div
        id="calendar-scroll"
        className="border rounded-lg overflow-y-auto"
        style={{ maxHeight: `${MAX_GRID_HEIGHT}px` }}
      >
        {/* Hour labels + day columns */}
        <div className="flex">
          {/* Hour label column */}
          <div className="w-12 flex-shrink-0 border-r bg-muted/30">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: `${PX_PER_HOUR}px` }}
                className="text-[10px] font-medium text-muted-foreground px-1 py-0.5 border-b"
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex flex-1">
            {weekDays.map((day, dayIdx) => (
              <div key={dayIdx} className="flex-1 border-r last:border-r-0">
                {/* Day header */}
                <div
                  className={cn(
                    "text-center py-1.5 border-b text-xs font-semibold",
                    isSameDay(day, today) && "bg-primary/10",
                  )}
                >
                  <div>{DAYS[dayIdx]}</div>
                  <div
                    className={cn(
                      "text-xs",
                      isSameDay(day, today) && "font-bold text-primary",
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Time grid */}
                <div className="relative">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ height: `${PX_PER_HOUR}px` }}
                      className="border-b bg-white dark:bg-slate-950 hover:bg-muted/50 transition-colors"
                    />
                  ))}

                  {/* Events for this day */}
                  <div className="absolute inset-0">
                    {eventsByDay[dayIdx]?.map(({ event, colorIdx }) => (
                      <EventBlock
                        key={event.id}
                        event={event}
                        colorIdx={colorIdx}
                        onClick={() => onSelectEvent(event, colorIdx)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── DayView Component ───────────────────────────────────────────────────────  // 3.
  interface DayViewProps {
    date: Date;
    eventsByDate: Record<string, { event: CalendarEvent; colorIdx: number }[]>;
    onSelectEvent: (event: CalendarEvent, colorIdx: number) => void;
  }

  function DayView({ date, eventsByDate, onSelectEvent }: DayViewProps) {
    const key = date.toDateString();
    const dayEvents = eventsByDate[key] ?? [];

    return (
      <div
        id="calendar-scroll"
        className="border rounded-lg overflow-y-auto"
        style={{ maxHeight: `${MAX_GRID_HEIGHT}px` }}
      >
        <div className="flex">
          {/* Hour label column */}
          <div className="w-12 flex-shrink-0 border-r bg-muted/30">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: `${PX_PER_HOUR}px` }}
                className="text-[10px] font-medium text-muted-foreground px-1 py-0.5 border-b"
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Single day column */}
          <div className="flex-1 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: `${PX_PER_HOUR}px` }}
                className="border-b bg-white dark:bg-slate-950 hover:bg-muted/50 transition-colors"
              />
            ))}
            <div className="absolute inset-0">
              {dayEvents.map(({ event, colorIdx }) => (
                <EventBlock
                  key={event.id}
                  event={event}
                  colorIdx={colorIdx}
                  onClick={() => onSelectEvent(event, colorIdx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Monthview component
  interface MonthViewProps {
    events: CalendarEvent[];
    onSelectEvent: (event: CalendarEvent, colorIdx: number) => void;
    onSelectDay: (date: Date) => void;
  }

  function MonthView({ events, onSelectEvent, onSelectDay }: MonthViewProps) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Group events by day
    const eventsByDate: Record<
      string,
      { event: CalendarEvent; colorIdx: number }[]
    > = {};
    events.forEach((event, idx) => {
      const dateKey = event.startTime.toISOString().split("T")[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push({ event, colorIdx: idx });
    });

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center py-2 text-xs font-semibold border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dateKey = day.toISOString().split("T")[0];
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = isSameDay(day, today);

            return (
              <div
                key={idx}
                onClick={() => onSelectDay(day)} // 2. day click handler
                className={cn(
                  "min-h-24 border-r border-b last:border-r-0 p-1",
                  "cursor-pointer hover:bg-muted/40 transition-colors", // 2. clickable styles
                  !isCurrentMonth && "bg-muted/30",
                  isToday && "bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "text-xs font-semibold mb-1",
                    isToday && "text-primary font-bold",
                    !isCurrentMonth && "text-muted-foreground",
                  )}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(({ event, colorIdx }) => {
                    const color = PALETTE[colorIdx % PALETTE.length];
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event, colorIdx);
                        }}
                        className={cn(
                          "w-full text-left px-1 py-0.5 rounded text-[10px] font-semibold truncate",
                          "transition-all hover:opacity-80 cursor-pointer",
                          color.bg,
                          color.text,
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-muted-foreground px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* header */}
      <div className="flex items-center gap-2 mb-3">
        {view === "day" ? (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("week")}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium flex-1">
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevWeek}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextWeek}
              className="h-7 w-7"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium tabular-nums flex-1">
              {view === "week" ? weekLabel : format(weekStart, "MMMM yyyy")}
            </span>

            {/* View toggle buttons */}
            <div className="flex gap-1">
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
                className="h-7 text-xs px-2"
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
                className="h-7 text-xs px-2"
              >
                Month
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 text-xs px-2"
            >
              Today
            </Button>
          </>
        )}
      </div>

      {/* Conditional rendering */}
      {view === "day" ? (
        <DayView
          date={selectedDate!}
          eventsByDate={eventsByDate}
          onSelectEvent={(e, idx) => {
            setSelectedEvent(e);
            setSelectedColorIdx(idx);
          }}
        />
      ) : view === "week" ? (
        <WeekView
          weekStart={weekStart}
          events={events}
          eventsByDay={eventsByDay} // 4. was missing in original
          onSelectEvent={(e, idx) => {
            setSelectedEvent(e);
            setSelectedColorIdx(idx);
          }}
        />
      ) : (
        <MonthView
          events={events}
          onSelectEvent={(e, idx) => {
            setSelectedEvent(e);
            setSelectedColorIdx(idx);
          }}
          onSelectDay={(date) => {
            setSelectedDate(date);
            setView("day");
          }}
        />
      )}

      <EventDetailModal
        event={selectedEvent}
        colorIdx={selectedColorIdx}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
