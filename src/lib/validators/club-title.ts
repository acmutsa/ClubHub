import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubTitles } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";


export const clubTitleSchema = createSelectSchema(clubTitles);

export const createClubTitleSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

export const updateClubTitleSchema = createClubTitleSchema.omit({ clubId: true }).partial();
