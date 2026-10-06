import { z } from "zod";
import {
  createImageUploadSchema,
  createResumeUploadSchema,
  fileSchema,
  insertImageFileSchema,
  insertResumeFileSchema,
} from "@/lib/validators/file";

export type FileRecord = z.infer<typeof fileSchema>;
export type CreateResumeUploadInput = z.infer<typeof createResumeUploadSchema>;
export type CreateImageUploadInput = z.infer<typeof createImageUploadSchema>;
export type InsertResumeFileInput = z.infer<typeof insertResumeFileSchema>;
export type InsertImageFileInput = z.infer<typeof insertImageFileSchema>;
