import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubSponsors } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";


export const clubSponsorSchema = createSelectSchema(clubSponsors);

export const createClubSponsorSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  logoFileId: idSchema.nullable(),
  websiteUrl: z.url({ protocol: /^https?$/ }).trim().max(2000, "URL is too long").nullable(),
});

export const updateClubSponsorSchema = createClubSponsorSchema.omit({ clubId: true }).partial();
