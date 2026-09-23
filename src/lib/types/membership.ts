import { z } from "zod";

export const membershipRoles = ["MEMBER", "ADMIN", "SUPER_ADMIN"] as const;
export const membershipRoleSchema = z.enum(membershipRoles);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;
