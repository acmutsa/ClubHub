import type { z } from "zod";

import { createUserProfileSchema } from "@/lib/validators/user-profile";

export const updateSettingsSchema = createUserProfileSchema;

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
