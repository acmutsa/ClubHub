import { z } from "zod";
import { user } from "@/db/auth.schema";

export type User = typeof user.$inferSelect;

export const userRoles = ["user", "admin", "super_admin"] as const;
export const userRoleSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleSchema>;

export interface UserProp {
  user: {
    id: string;
    role: UserRole;
  }
}