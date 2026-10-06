import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubRoles } from "@/db/schema";
import { Permission } from "@/constants/permissions";
import { MEMBER_ROLE_POSITION, OWNER_ROLE_POSITION } from "@/constants/role-positions";
import { hexColorSchema, idSchema } from "@/lib/validators/common";


export const clubRoleSchema = createSelectSchema(clubRoles);

export const createClubRoleSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Role is required").max(30, "Role is too long").regex(/^[A-Z][A-Z0-9_]*$/, "Use capital letters and underscores, such as CLUB_TREASUER or EVENT_ADMIN"),
  description: z.string().trim().max(500, "Description is too long").nullable(),
  permissions: z.array(z.enum(Permission, { message: "Select a permission" })).min(1, "Select at least one permission"),
  color: hexColorSchema,
  // Custom roles sit strictly between MEMBER and OWNER
  position: z.number().int("Position must be a whole number").gt(MEMBER_ROLE_POSITION, "Position must be above Member").lt(OWNER_ROLE_POSITION, "Position must be below Owner"),
});

// System roles (MEMBER, OWNER) cannot be renamed or moved
export const updateClubRoleSchema = createClubRoleSchema.omit({ clubId: true }).partial();

