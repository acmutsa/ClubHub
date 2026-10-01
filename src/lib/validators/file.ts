import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { files } from "@/db/schema";
import { idSchema } from "@/lib/validators/common";

// File (uploadedById is null only after the uploader was deleted)
export const fileSchema = createSelectSchema(files);

// The server sets id, storageKey, and uploadedById after the upload succeeds
export const createFileSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(255, "File name is too long"),
  mimeType: z.string().trim().min(1, "File type is required").max(255),
  sizeBytes: z.number().int().positive("File cannot be empty"),
});

// Full row the server inserts: the uploader is required here even though the column is nullable
export const insertFileSchema = createInsertSchema(files, {
  uploadedById: idSchema,
});
