import { events, eventTypes, thumbnails } from "@/db/schema";
import { baseClubSelectSchema } from "@/lib/validators/club";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { baseLocationSelectSchema } from "@/lib/validators/location";
import { z } from "zod";

// Thumbnail
export const baseThumbnailSelectSchema = createSelectSchema(thumbnails);

// Event Type
export const baseEventTypeSelectSchema = createSelectSchema(eventTypes);

// Event
export const baseEventSelectSchema = createSelectSchema(events);

export const adminEventSelectSchema = baseEventSelectSchema.extend({
  club: baseClubSelectSchema,
  eventTypes: baseEventTypeSelectSchema,
  location: baseLocationSelectSchema.nullable(),
  thumbnail: baseThumbnailSelectSchema.nullable(),
});

// Base Event Insert Schema (without refinements - for react-hook-form)
export const eventInsertBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  start: z.date({ message: "Start date is required" }),
  end: z.date({ message: "End date is required" }),
  checkinStart: z.date({ message: "Check-in start is required" }),
  checkinEnd: z.date({ message: "Check-in end is required" }),
  eventTypeId: z.number({ message: "Event type is required" }),
  locationId: z.number().optional().nullable(),
  thumbnailId: z.number().optional().nullable(),
  points: z.number("Points must be a number").min(0, "Points must be positive"),
  hidden: z.boolean(),
});

// Full Event Insert Schema (with refinements - for server validation)
export const eventInsertSchema = eventInsertBaseSchema
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  })
  .refine((data) => data.checkinEnd > data.checkinStart, {
    message: "Check-in end must be after check-in start",
    path: ["checkinEnd"],
  });

export type EventInsertInput = z.infer<typeof eventInsertBaseSchema>;
