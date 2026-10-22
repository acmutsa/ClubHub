import { cache } from "react";

import { requireCurrentUser } from "@/lib/auth/current-user";

export const getPlatformContext = cache(async () => {
  const user = await requireCurrentUser();
  return { user, isAdmin: user.role === "ADMIN" };
});

export async function requirePlatformContext() {
  return getPlatformContext();
}

export type PlatformContext = Awaited<ReturnType<typeof getPlatformContext>>;
