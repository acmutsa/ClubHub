import { z } from "zod";
import { user } from "@/db/auth.schema";

export type User = typeof user.$inferSelect;

export const userRoles = ["user", "admin", "super_admin"] as const;
export const memberRoles = ["member", "admin", "officer"] as const;
export const userRoleSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleSchema>;
export type memberRole = z.infer<typeof memberRoles>;
export interface UserProp {
    user: {
        id: string;
        role: UserRole;
    }
}

export interface ClubLink {
    id: string;
    name: string;
}

export interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    clubCount: number;
    clubs: ClubLink[];
}

export interface MemberRow {
    id: string;
    name: string;
    email: string;
    role: memberRole;
}