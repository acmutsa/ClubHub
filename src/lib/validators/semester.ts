import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { semesters } from "@/db/schema";

// Semester
export const semesterSchema = createSelectSchema(semesters);

// Base form schema (without refinements - for react-hook-form)
export const createSemesterFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
});

// Full schema (with refinements - for server validation)
export const createSemesterSchema = createSemesterFormSchema.refine(
  (semester) => semester.endDate > semester.startDate,
  { path: ["endDate"], message: "End date must be after the start date" },
);
