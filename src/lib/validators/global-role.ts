import { z } from "zod";
import { GLOBAL_ROLES } from "@/constants/roles";

export const globalRoleSchema = z.object({ role: z.enum(GLOBAL_ROLES) });

export const createGlobalRoleSchema = globalRoleSchema;

export const updateGlobalRoleSchema = createGlobalRoleSchema;
