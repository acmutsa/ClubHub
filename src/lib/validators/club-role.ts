import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubRoles } from "@/db/schema";
import { permission } from "@/config/constants";
import { hexColorSchema, idSchema } from "@/lib/validators/common";


export const clubRoleSchema = createSelectSchema(clubRoles);

export const createClubRoleSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Role is required").max(30, "Role is too long").regex(/^[A-Z][A-Z0-9_]*$/, "Use capital letters and underscores, such as CLUB_TREASUER or EVENT_ADMIN"),
  description: z.string().trim().max(500, "Description is too long").nullable(),
  permissions: z.array(z.enum(permission, { message: "Select a permission" })).min(1, "Select at least one permission"),
  color: hexColorSchema,
});

// System roles (MEMBER, ADMIN) cannot be renamed
export const updateClubRoleSchema = createClubRoleSchema.omit({ clubId: true }).partial();

