import { z } from "zod";

export const membershipRoles = ["member", "admin", "super_admin"] as const;
export const membershipRoleSchema = z.enum(membershipRoles);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;

export const createRoleSchema = z.object({
    name: z.string().min(1),
    position: z.number(),
    slug: z.string(),
    permissions: z.number(),
})