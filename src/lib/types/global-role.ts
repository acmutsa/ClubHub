import { z } from "zod";
import {
  createGlobalRoleSchema,
  globalRoleSchema,
  updateGlobalRoleSchema,
} from "@/lib/validators/global-role";

export type GlobalRole = z.infer<typeof globalRoleSchema>;
export type CreateGlobalRoleInput = z.infer<typeof createGlobalRoleSchema>;
export type UpdateGlobalRoleInput = z.infer<typeof updateGlobalRoleSchema>;
