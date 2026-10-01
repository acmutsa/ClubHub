import { checkIns, eventCategories, events } from "@/db/schema";
import { clubSchema } from "@/lib/validators/club";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { fileSchema } from "@/lib/validators/file";
import { addressSchema, locationSchema } from "@/lib/validators/location";
import { subOrgSchema } from "@/lib/validators/sub-org";
import { hexColorSchema, idSchema } from "@/lib/validators/common";
import { z } from "zod";

// Event Category
export const eventCategorySchema = createSelectSchema(eventCategories);

export const createEventCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().trim().max(500, "Description is too long").nullable(),
  color: hexColorSchema,
});

// Event
export const eventSchema = createSelectSchema(events);

export const adminEventSchema = eventSchema.extend({
  club: clubSchema,
  category: eventCategorySchema,
  subOrg: subOrgSchema.nullable(),
  location: locationSchema.nullable(),
  address: addressSchema.nullable(),
  thumbnail: fileSchema.nullable(),
});

// Base Event Insert Schema (without refinements - for react-hook-form)
export const createEventFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required"),
  startsAt: z.date({ message: "Start date is required" }),
  endsAt: z.date({ message: "End date is required" }),
  checkinStartsAt: z.date({ message: "Check-in start is required" }),
  checkinEndsAt: z.date({ message: "Check-in end is required" }),
  categoryId: idSchema,
  subOrgId: idSchema.nullable(),
  locationId: idSchema.nullable(),
  addressId: idSchema.nullable(),
  thumbnailFileId: idSchema.nullable(),
  points: z.number("Points must be a number").int("Points must be a whole number").min(0, "Points cannot be negative"),
});

// Full Event Insert Schema (with refinements - for server validation)
export const createEventSchema = createEventFormSchema
  .refine((event) => event.endsAt > event.startsAt, {
    message: "End date must be after the start date",
    path: ["endsAt"],
  })
  .refine((event) => event.checkinEndsAt > event.checkinStartsAt, {
    message: "Check-in end must be after check-in start",
    path: ["checkinEndsAt"],
  });

export type CreateEventInput = z.infer<typeof createEventFormSchema>;

// Check-In (checkedInById is null only after the staff member was deleted)
export const checkInSchema = createSelectSchema(checkIns);

// The server sets clubId and checkedInById from trusted context
export const createCheckInSchema = z.object({
  eventId: idSchema,
  userId: idSchema,
});

// Full row the server inserts: the staff member is required here even though the column is nullable
export const insertCheckInSchema = createInsertSchema(checkIns, {
  checkedInById: idSchema,
});
