import { z } from "zod";
import { updateUserProfileSchema } from "@/lib/validators/user-profile";

export const updateSettingsSchema = updateUserProfileSchema.extend({
  expectedGraduationDate: z.date({ message: "Expected graduation date is required" }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
