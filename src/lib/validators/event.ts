import { events, eventTypes, thumbnails } from "@/db/schema";
import { clubSchema } from "@/lib/validators/club";
import { createSelectSchema } from "drizzle-zod";
import { locationSchema } from "@/lib/validators/location";
import { z } from "zod";

// Thumbnail
export const thumbnailSchema = createSelectSchema(thumbnails);

// Event Type
export const eventTypeSchema = createSelectSchema(eventTypes);

// Event
export const eventSchema = createSelectSchema(events);

export const adminEventSchema = eventSchema.extend({
  club: clubSchema,
  eventTypes: eventTypeSchema,
  location: locationSchema.nullable(),
  thumbnail: thumbnailSchema.nullable(),
});

// Base Event Insert Schema (without refinements - for react-hook-form)
export const createEventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  startAt: z.date({ message: "Start date is required" }),
  endAt: z.date({ message: "End date is required" }),
  checkInStartAt: z.date({ message: "Check-in startAt is required" }),
  checkInEndAt: z.date({ message: "Check-in endAt is required" }),
  eventTypeId: z.number({ message: "Event type is required" }),
  locationId: z.number().optional().nullable(),
  points: z.number("Points must be a number").min(0, "Points must be positive"),
  hidden: z.boolean(),
});

// Full Event Insert Schema (with refinements - for server validation)
export const createEventSchema = createEventFormSchema
  .refine((data) => data.endAt > data.startAt, {
    message: "End date must be after startAt date",
    path: ["endAt"],
  })
  .refine((data) => data.checkInEndAt > data.checkInStartAt, {
    message: "Check-in endAt must be after check-in startAt",
    path: ["checkInEndAt"],
  });

export type CreateEventInput = z.infer<typeof createEventFormSchema>;
