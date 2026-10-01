import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { checkIns } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";

export const checkInSchema = createSelectSchema(checkIns);

export const createCheckInSchema = z.object({
  userId: idSchema,
  eventId: idSchema,
});

export const insertCheckInSchema = createCheckInSchema.extend({
  clubId: idSchema,
  checkedInById: idSchema,
});


