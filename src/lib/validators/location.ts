import { locations } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const locationSchema = createSelectSchema(locations);