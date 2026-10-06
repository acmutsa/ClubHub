import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { subOrgs } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";


export const subOrgSchema = createSelectSchema(subOrgs);

export const createSubOrgSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().trim().min(1, "Description is required").max(1000, "Description is too long"),
  logoFileId: idSchema.nullable(),
});

export const updateSubOrgSchema = createSubOrgSchema.omit({ clubId: true }).partial();
