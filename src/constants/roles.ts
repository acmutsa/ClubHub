import { ALL_PERMISSIONS, type Permission } from "@/constants/permissions";
import { MEMBER_ROLE_POSITION, OWNER_ROLE_POSITION } from "@/constants/role-positions";

export const GLOBAL_ROLES = ["USER", "ADMIN"] as const;
export type GlobalRoleName = (typeof GLOBAL_ROLES)[number];

export const SYSTEM_CLUB_ROLES = [
  { name: "MEMBER", description: "Default role for club members", permissions: [], color: "#71717a", position: MEMBER_ROLE_POSITION, isSystem: true },
  { name: "OWNER", description: "Full access to the club", permissions: ALL_PERMISSIONS, color: "#3b82f6", position: OWNER_ROLE_POSITION, isSystem: true },
] as const satisfies readonly { name: string; description: string; permissions: readonly Permission[]; color: string; position: number; isSystem: true }[];

export type SystemClubRoleName = (typeof SYSTEM_CLUB_ROLES)[number]["name"];
