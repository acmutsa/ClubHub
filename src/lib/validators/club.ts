import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubs } from "@/db/schema";
import { clubCategories } from "@/config/constants";
import { hexColorSchema, idSchema, paginationSchema } from "@/lib/validators/common";


export const clubSchema = createSelectSchema(clubs);

export const createClubSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  slug: z.string().trim().min(1, "Slug is required").max(100, "Slug is too long").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description is too long"),
  mission: z.string().trim().max(2000, "Mission is too long").nullable(),
  category: z.string({ message: "Category is required" }).trim().min(1, "Category is required").max(50, "Category is too long").transform( (category) => clubCategories.find((option) => option.toLowerCase() === category.toLowerCase()) ?? category).pipe(z.enum(clubCategories, { message: "Select a valid category" })),
  color: hexColorSchema.nullable(),
  logoFileId: idSchema.nullable(),
  bannerFileId: idSchema.nullable(),
});

export const insertClubSchema = createClubSchema.extend({
  createdById: idSchema,
});

export const updateClubSchema = createClubSchema.partial();

export const clubFiltersSchema = paginationSchema.extend({
  nameQuery: z.string().trim().max(100, "Search is too long").default(""),
  category: z.string().trim().max(50).optional(),
  sortBy: z.enum(["name", "category"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
