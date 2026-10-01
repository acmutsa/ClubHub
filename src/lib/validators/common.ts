import { z } from "zod";

export const idSchema = z.string().trim().min(1, "ID is required");

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value such as #3b82f6");
