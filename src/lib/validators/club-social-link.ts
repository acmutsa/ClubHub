import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clubSocialLinks } from "@/db/schema";
import { socialPlatform } from "@/config/constants";
import { idSchema } from "@/lib/validators/common";


const socialLinkCodes = socialPlatform.map((platform) => platform.code);


export const clubSocialLinkSchema = createSelectSchema(clubSocialLinks);

export const createClubSocialLinkSchema = z.object({
  clubId: idSchema,
  platform: z.enum(socialLinkCodes, { message: "Select a platform" }),
  url: z.url({ protocol: /^https?$/ }).trim().max(2000, "URL is too long").nullable(),
});

export const updateClubSocialLinkSchema = createClubSocialLinkSchema.omit({ clubId: true }).partial();

