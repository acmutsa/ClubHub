import * as z from "zod";

import { countries } from "@/constants/countries";
import {
  ethnicityOptions,
  genderOptions,
  raceOptions,
} from "@/constants/demographics";
import { majorOptions } from "@/constants/majors";
import { shirtSizeOptions } from "@/constants/shirt-sizes";

const countryCodes = countries.map((country) => country.code);

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const registrationFormSchema = z.object({
  classification: z.enum(
    ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
    { error: "Please select your class year" },
  ),
  gender: z.enum(genderOptions, { error: "Please select your gender" }),
  race: z.enum(raceOptions, { error: "Please select your race/ethnicity" }),
  ethnicity: z.enum(ethnicityOptions, {
    error: "Please select your ethnicity",
  }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  pronouns: z.string().trim().min(1, "Please enter your pronouns").max(50),
  birthDate: z
    .string()
    .date("Please enter your date of birth")
    .refine((date) => new Date(date) < new Date(), "Birth date must be in the past"),
  country: z.enum(countryCodes, { error: "Please select your country" }),
  shirtSize: z.enum(shirtSizeOptions, { error: "Please select a shirt size" }),
  major: z
    .string()
    .refine(
      (major) => majorOptions.some((option) => option === major),
      "Please select your major",
    ),
  college: z.string().min(1, { message: "Please select your college" }),
  department: z
    .string()
    .trim()
    .min(1, { message: "Please enter your department" }),
  account: z.object({
    firstName: z
      .string()
      .trim()
      .min(1, { message: "Please enter your first name" }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Please enter your last name" }),
    email: z.string().trim().email({ message: "Please enter a valid email address" }),
  }),
  expectedGraduationDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Please enter your expected graduation month")
    .refine(
      (month) => month > getCurrentMonth(),
      "Expected graduation month must be in the future",
    ),
  emailReminder: z.boolean(),
  phoneReminder: z.boolean(),
  smsReminder: z.boolean(),
});

export const registrationDraftSchema = z.object({
  step: z.number().int().min(1).max(6),
  values: z.object({
    classification: z.enum(["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]).optional(),
    gender: z.enum(genderOptions).optional(),
    race: z.enum(raceOptions).optional(),
    ethnicity: z.enum(ethnicityOptions).optional(),
    phoneNumber: z.string().optional(),
    pronouns: z.string().optional(),
    birthDate: z.string().optional(),
    country: z.enum(countryCodes).optional(),
    shirtSize: z.enum(shirtSizeOptions).optional(),
    major: z.string().optional(),
    college: z.string().optional(),
    department: z.string().optional(),
    account: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    expectedGraduationDate: z.string().optional(),
    emailReminder: z.boolean().optional(),
    phoneReminder: z.boolean().optional(),
    smsReminder: z.boolean().optional(),
  }),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
