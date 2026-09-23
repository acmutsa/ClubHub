import { headers } from "next/headers";
import { cache } from "react";

import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { auth } from "@/lib/auth/server";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    return redirectToSignIn();
  }

  return user;
}
