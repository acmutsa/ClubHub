import { events, eventTypes, thumbnails } from "@/db/schema";
import { baseClubSelectSchema } from "@/lib/validators/club";
import { createSelectSchema } from "drizzle-zod";
import { baseLocationSelectSchema } from "@/lib/validators/location";

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
