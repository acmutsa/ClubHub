import * as z from "zod";
import { majorOptions } from "@/constants/majors";

export const registrationFormSchema = z.object({
  classification: z.enum(
    ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
    { error: "Please select your class year" },
  ),
  gender: z.enum(
    ["Male", "Female", "Non-Binary", "Prefer Not to Say"],
    { error: "Please select your gender" },
  ),
  race: z.enum(
    [
      "White",
      "Black or African American",
      "Asian",
      "Native American",
      "Pacific Islander",
      "Other",
    ],
    { error: "Please select your race/ethnicity" },
  ),
  ethnicity: z.enum(["Hispanic", "Non-Hispanic"], {
    error: "Please select your ethnicity",
  }),
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
    .min(1, { message: "Please enter your expected graduation date" }),
  emailReminder: z.boolean(),
  phoneReminder: z.boolean(),
  smsReminder: z.boolean(),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
