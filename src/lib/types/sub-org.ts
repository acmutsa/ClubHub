import { z } from "zod";
import {
  createSubOrgSchema,
  subOrgSchema,
  updateSubOrgSchema,
} from "@/lib/validators/sub-org";

export type SubOrg = z.infer<typeof subOrgSchema>;
export type CreateSubOrgInput = z.infer<typeof createSubOrgSchema>;
export type UpdateSubOrgInput = z.infer<typeof updateSubOrgSchema>;
