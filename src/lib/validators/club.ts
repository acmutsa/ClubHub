import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  clubMemberships,
  clubRoles,
  clubs,
  clubSocialLinks,
  clubSponsors,
} from "@/db/schema";
import { clubCategories, permission, socialPlatform } from "@/config/constants";
import { hexColorSchema, idSchema } from "@/lib/validators/common";

const socialPlatformKeys = Object.keys(socialPlatform) as (keyof typeof socialPlatform)[];

// A suggested category or the club's own text; matching suggestions keep their listed spelling
const clubCategorySchema = z
  .string({ message: "Category is required" })
  .trim()
  .min(1, "Category is required")
  .max(50, "Category is too long")
  .transform(
    (category) =>
      clubCategories.find((option) => option.toLowerCase() === category.toLowerCase()) ?? category,
  );

// Club (createdById is null only after the creator was deleted)
export const clubSchema = createSelectSchema(clubs);
export const adminClubSchema = clubSchema.extend({});

// The server sets id and createdById from trusted context
export const createClubSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description is too long"),
  mission: z.string().trim().max(2000, "Mission is too long").nullable(),
  category: clubCategorySchema,
  color: hexColorSchema.nullable(),
  logoFileId: idSchema.nullable(),
  bannerFileId: idSchema.nullable(),
});

// Full row the server inserts: the creator is required here even though the column is nullable
export const insertClubSchema = createInsertSchema(clubs, {
  createdById: idSchema,
  category: clubCategorySchema,
});

// Club Social Link
export const clubSocialLinkSchema = createSelectSchema(clubSocialLinks);

export const createClubSocialLinkSchema = z.object({
  platform: z.enum(socialPlatformKeys, { message: "Select a platform" }),
  url: z.url("Enter a valid URL"),
});

// Club Sponsor
export const clubSponsorSchema = createSelectSchema(clubSponsors);

export const createClubSponsorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  logoFileId: idSchema.nullable(),
  websiteUrl: z.url("Enter a valid URL").nullable(),
});

// Club Role
export const clubRoleSchema = createSelectSchema(clubRoles);

// The server sets isSystem; only built-in roles have it
export const createClubRoleSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  permission: z.enum(permission, { message: "Select a permission" }),
  color: hexColorSchema,
  description: z.string().trim().max(500, "Description is too long").nullable(),
});

// Club Membership
export const clubMembershipSchema = createSelectSchema(clubMemberships);

export const updateClubMembershipSchema = z.object({
  roleId: idSchema,
  applicationStatus: z.enum(clubMemberships.applicationStatus.enumValues),
  status: z.enum(clubMemberships.status.enumValues),
});
