import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userProfiles } from "@/db/schema";
import {
  countries,
  ethnicityOptions,
  genderOptions,
  majorOptions,
  raceOptions,
  schoolOptions,
  shirtSizeOptions,
} from "@/config/constants";
import { idSchema, paginationSchema } from "@/lib/validators/common";


const countryCodes = countries.map((country) => country.code);

export const userProfileSchema = createSelectSchema(userProfiles, {
  race: z.array(z.enum(raceOptions)),
  gender: z.enum(genderOptions),
});

export const createUserProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  phoneNumber: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  pronouns: z.string().trim().min(1, "Pronouns are required").max(50, "Pronouns are too long"),
  birthDate: z.date({ message: "Birth date is required" }).refine((date) => date < new Date(), "Birth date must be in the past"),
  school: z.enum(schoolOptions, { message: "Select a school" }),
  expectedGraduationDate: z.date({ message: "Expected graduation date is required" }).refine((date) => date > new Date(), "Expected graduation date must be in the future"),
  major: z.enum(majorOptions, { message: "Select a major" }),
  country: z.enum(countryCodes, { message: "Select a country" }),
  race: z.array(z.enum(raceOptions)).min(1, "Select at least one option"),
  gender: z.enum(genderOptions, { message: "Select a gender" }),
  ethnicity: z.enum(ethnicityOptions, { message: "Select an ethnicity" }),
  shirtSize: z.enum(shirtSizeOptions, { message: "Select a shirt size" }),
  eventAnnouncementEmail: z.boolean(),
  eventAnnouncementPhone: z.boolean(),
});

export const insertUserProfileSchema = createUserProfileSchema.extend({
  resumeFileId: idSchema.nullable()
});

export const updateUserProfileSchema = insertUserProfileSchema.partial();

export const userProfileFiltersSchema = paginationSchema.extend({
  nameQuery: z.string().trim().max(100, "Search is too long").default("").optional(),
  school: z.enum(schoolOptions).optional(),
  major: z.enum(majorOptions).optional(),
});
