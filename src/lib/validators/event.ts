import { events } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { idSchema, paginationSchema } from "@/lib/validators/common";
import { z } from "zod";

export const eventSchema = createSelectSchema(events);

export const createEventFormSchema = z.object({
  categoryId: idSchema,
  subOrgId: idSchema.nullable(),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(1500, "Description is too long"),
  startsAt: z.date({ message: "Start date is required" }),
  endsAt: z.date({ message: "End date is required" }),
  checkinStartsAt: z.date({ message: "Check-in start is required" }),
  checkinEndsAt: z.date({ message: "Check-in end is required" }),
  points: z.number("Points must be a number").int("Points must be a whole number").min(0, "Points cannot be negative"),
})
  .refine((event) => event.endsAt > event.startsAt, { message: "End date must be after the start date", path: ["endsAt"] })
  .refine((event) => event.checkinEndsAt > event.checkinStartsAt, { message: "Check-in end must be after check-in start", path: ["checkinEndsAt"] });

export const insertEventFormSchema = createEventFormSchema.safeExtend({
  locationId: idSchema.nullable().default(null),
  addressId: idSchema.nullable().default(null),
  thumbnailFileId: idSchema.nullable().default(null),
});

export const updateEventSchema = insertEventFormSchema
  .omit({ locationId: true, addressId: true })
  .partial()
  .refine((event) => !event.startsAt || !event.endsAt || event.endsAt > event.startsAt, { message: "End date must be after the start date", path: ["endsAt"] })
  .refine((event) => !event.checkinStartsAt || !event.checkinEndsAt || event.checkinEndsAt > event.checkinStartsAt, { message: "Check-in end must be after check-in start", path: ["checkinEndsAt"] });


export const eventFiltersSchema = paginationSchema.extend({
    nameQuery: z.string().trim().max(100, "Search is too long").default("").optional(),
    categoryId: idSchema.optional(),
    subOrgId: idSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((filters) => !filters.from || !filters.to || filters.to >= filters.from, { message: "End of the range must be after the start", path: ["to"]});
