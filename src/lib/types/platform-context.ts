import type { CurrentUser } from "@/lib/types/current-user";

export type PlatformContext = {
  user: CurrentUser;
  isAdmin: boolean;
};
