import { createSelectSchema } from "drizzle-zod";
import { clubs } from "@/db/schema";

export const baseClubSelectSchema = createSelectSchema(clubs);
export const adminClubSelectSchema = baseClubSelectSchema.extend({});
