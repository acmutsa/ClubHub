import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { globalRoles } from "@/db/schema";

 
export const globalRoleSchema = createSelectSchema(globalRoles);

export const createGlobalRoleSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(30, "Role is too long").regex(/^[A-Z][A-Z0-9_]*$/, "Use capital letters and underscores, such as CLUB_TREASUER or EVENT_ADMIN")
});

export const updateGlobalRoleSchema = createGlobalRoleSchema
