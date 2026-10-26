import { cache } from "react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";

export const getPlatformContext = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user, isAdmin: user.role === "ADMIN" };
});

export async function requirePlatformContext() {
  const context = await getPlatformContext();
  if (!context) return redirectToSignIn();
  return context;
}

export type PlatformContext = NonNullable<Awaited<ReturnType<typeof getPlatformContext>>>;
