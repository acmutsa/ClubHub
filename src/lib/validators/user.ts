import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { globalRoles, userProfiles } from "@/db/schema";
import {
  countries,
  ethnicityOptions,
  genderOptions,
  majorOptions,
  raceOptions,
  schoolOptions,
  shirtSizeOptions,
} from "@/config/constants";
import { idSchema } from "@/lib/validators/common";

const countryNames = countries.map((country) => country.name);

// Global Role
export const globalRoleSchema = createSelectSchema(globalRoles);

// User Profile
export const userProfileSchema = createSelectSchema(userProfiles, {
  race: z.array(z.enum(raceOptions)),
  gender: z.enum(genderOptions),
});

// The server sets userId from the signed-in user
export const createUserProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").max(10, "Phone number is too long"),
  pronouns: z.string().trim().min(1, "Pronouns are required").max(50, "Pronouns are too long"),
  birthDate: z.date({ message: "Birth date is required" }).max(new Date(), "Birth date must be in the past"),
  school: z.enum(schoolOptions, { message: "Select a school" }),
  expectedGraduationDate: z.date({ message: "Expected graduation date is required" }),
  major: z.enum(majorOptions, { message: "Select a major" }),
  resumeFileId: idSchema.nullable(),
  country: z.enum(countryNames, { message: "Select a country" }),
  race: z.array(z.enum(raceOptions)).min(1, "Select at least one option"),
  gender: z.enum(genderOptions, { message: "Select a gender" }),
  ethnicity: z.enum(ethnicityOptions, { message: "Select an ethnicity" }),
  shirtSize: z.enum(shirtSizeOptions, { message: "Select a shirt size" }),
  eventAnnouncementEmail: z.boolean(),
  eventAnnouncementPhone: z.boolean(),
});

