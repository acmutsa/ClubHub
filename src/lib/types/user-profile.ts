import { z } from "zod";
import {
  createUserProfileSchema,
  insertUserProfileSchema,
  updateUserProfileSchema,
  userProfileFiltersSchema,
  userProfileSchema,
} from "@/lib/validators/user-profile";

export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type InsertUserProfileInput = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UserProfileFilters = z.infer<typeof userProfileFiltersSchema>;
