import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { semesters } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";


export const semesterSchema = createSelectSchema(semesters);

export const createSemesterFormSchema = z.object({
  clubId: idSchema,
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
}).refine((semester) => semester.endDate > semester.startDate,{ path: ["endDate"], message: "End date must be after the start date" });

export const updateSemesterSchema = createSemesterFormSchema
  .omit({ clubId: true })
  .partial()
  .refine((semester) => !semester.startDate || !semester.endDate || semester.endDate > semester.startDate, {path: ["endDate"],message: "End date must be after the start date"});