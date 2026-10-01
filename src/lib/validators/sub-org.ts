import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { subOrgs } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";

// Sub-Org
export const subOrgSchema = createSelectSchema(subOrgs);

// The server sets clubId from the club context
export const createSubOrgSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().trim().max(1000, "Description is too long").nullable(),
  logoFileId: idSchema.nullable(),
});
