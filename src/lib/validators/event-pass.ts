import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { eventPasses } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";

export const eventPassSchema = createSelectSchema(eventPasses);

export const createEventPassSchema = z.object({
  eventId: idSchema,
});

export const scanEventPassSchema = z.object({
  eventId: idSchema,
  token: z.string().trim().min(1).max(512),
});

export const insertEventPassSchema = createEventPassSchema.safeExtend({
  id: idSchema,
  token: idSchema,
  userId: idSchema,
  clubId: idSchema,
  expiryDate: z.date(),
});

export const updateEventPassSchema = insertEventPassSchema.partial();
