import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AppSurface } from "@/lib/club-context/get-club-context";

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  surface?: Exclude<AppSurface, "landing">,
) {
  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.startsWith("/api") ||
    callbackUrl.startsWith("/sign-in")
  ) {
    return "/";
  }

  if (surface === "platform" && !callbackUrl.startsWith("/clubs")) {
    return "/clubs";
  }

  return callbackUrl;
}

export function getSignInUrl(
  callbackUrl: string | null | undefined,
  surface?: Exclude<AppSurface, "landing">,
) {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl, surface);

  if (safeCallbackUrl === "/") {
    return "/sign-in";
  }

  const params = new URLSearchParams({ callbackUrl: safeCallbackUrl });

  return `/sign-in?${params.toString()}`;
}

export async function redirectToSignIn(): Promise<never> {
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-current-path");
  const scope = requestHeaders.get("x-app-scope");
  const surface = scope === "platform" ? "platform" : "club";

  redirect(getSignInUrl(currentPath, surface));
}
