import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import type { PlatformContext } from "@/lib/types/platform-context";

export const getPlatformContext = cache(async (): Promise<PlatformContext | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    return { 
      user, 
      isAdmin: user.role === "ADMIN" 
    };
  },
);

export async function requirePlatformContext(): Promise<PlatformContext> {
  const context = await getPlatformContext();
  if (!context) return redirectToSignIn();
  return context;
}
