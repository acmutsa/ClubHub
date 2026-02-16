import { z } from "zod";

export const membershipRoles = ["member", "admin", "super_admin"] as const;
export const membershipRoleSchema = z.enum(membershipRoles);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;
