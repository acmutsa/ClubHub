import { z } from "zod";
import {
  createLocationSchema,
  insertLocationSchema,
  locationSchema,
  updateLocationSchema,
} from "@/lib/validators/location";

export type Location = z.infer<typeof locationSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type InsertLocationInput = z.infer<typeof insertLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
