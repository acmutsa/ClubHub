import { locations } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const baseLocationSelectSchema = createSelectSchema(locations);