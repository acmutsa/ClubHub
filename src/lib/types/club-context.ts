import type { Permission } from "@/constants/permissions";
import type { CurrentUser } from "@/lib/types/current-user";
import type { Club, ClubMembership, ClubRole } from "@/lib/types/club";

export type ClubContext = {
  user: CurrentUser;
  club: Club;
  clubId: string;
  membership: ClubMembership;
  role: ClubRole;
  permissions: Permission[];
  ipAddress: string | null;
  hasPermission: (permission: Permission) => boolean;
  requirePermission: (permission: Permission) => void;
};
