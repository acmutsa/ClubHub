import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { files } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const fileSchema = createSelectSchema(files);

export const createResumeUploadSchema = z.object({
  fileName : z.string().trim().min(1, "File name is required").max(255, "File name is too long"),
  mimeType : z.enum(["application/pdf"], { message: "The resume must be a PDF" }),
  sizeBytes: z.number().int().min(1, "The file is empty").max(MAX_RESUME_BYTES, "The resume must be 5 MB or smaller"),
});

export const createImageUploadSchema = z.object({
  fileName : z.string().trim().min(1, "File name is required").max(255, "File name is too long"),
  mimeType : z.enum(["image/png", "image/jpeg"], { message: "The image must be PNG or JPG" }),
  sizeBytes: z.number().int().min(1, "The image is empty").max(MAX_IMAGE_BYTES, "The image must be 5 MB or smaller"),
});

export const insertResumeFileSchema = createResumeUploadSchema.extend({
  storageKey: z.string().trim().min(1, "Storage key is required"),
  uploadedById: idSchema
});

export const insertImageFileSchema = createImageUploadSchema.extend({
  storageKey: z.string().trim().min(1, "Storage key is required"),
  uploadedById: idSchema
});
