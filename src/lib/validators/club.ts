import { createSelectSchema } from "drizzle-zod";
import { clubs } from "@/db/schema";

export const clubSchema = createSelectSchema(clubs);
export const adminClubSchema = clubSchema.extend({});
