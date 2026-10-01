import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { eventCategories } from "@/db/schema";
import { hexColorSchema, idSchema } from "@/lib/validators/common";


export const eventCategorySchema = createSelectSchema(eventCategories);

export const createEventCategorySchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description is too long"),
  color: hexColorSchema,
});

export const updateEventCategorySchema = createEventCategorySchema.omit({ clubId: true }).partial();

