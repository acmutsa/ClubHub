import { z } from "zod";
import {
  createSemesterFormSchema,
  semesterSchema,
  updateSemesterSchema,
} from "@/lib/validators/semester";

export type Semester = z.infer<typeof semesterSchema>;
export type CreateSemesterInput = z.infer<typeof createSemesterFormSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
