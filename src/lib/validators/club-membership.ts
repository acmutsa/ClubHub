import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubMemberships } from "@/db/schema";
import { idSchema, paginationSchema } from "@/lib/validators/common";


export const clubMembershipSchema = createSelectSchema(clubMemberships);

export const createClubMembershipSchema = z.object({
  clubId: idSchema,
});

export const insertClubMembershipSchema = createClubMembershipSchema.extend({
  userId: idSchema,
  roleId: idSchema,
  titleId: idSchema.nullable().default(null),
});

export const updateClubMembershipSchema = z.object({
  roleId: idSchema,
  applicationStatus: z.enum(clubMemberships.applicationStatus.enumValues),
  status: z.enum(clubMemberships.status.enumValues),
  titleId: idSchema.nullable(),
  inactiveAt: z.date({ message: "Inactive date must be a date" }).nullable(),
}).partial()
  .refine((membership) => membership.inactiveAt === undefined || membership.status !== undefined, { message: "Status is required when setting the inactive date", path: ["status"] })
  .refine((membership) => membership.status !== "active" || !membership.inactiveAt, { message: "An active membership cannot have an inactive date", path: ["inactiveAt"] })
  // status and inactiveAt are always saved together so the database check passes
  .transform((membership) => membership.status === undefined ? membership : { ...membership, inactiveAt: membership.status === "inactive" ? (membership.inactiveAt ?? new Date()) : null });

export const clubMembershipFiltersSchema = paginationSchema.extend({
  clubId: idSchema,
  nameQuery: z.string().trim().max(100, "Search is too long").default(""),
  roleId: idSchema.optional(),
  sortBy: z.enum(["name", "role"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

