import { headers } from "next/headers";
import { cache } from "react";

import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { auth } from "@/lib/auth/server";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // A soft-deleted account counts as signed out everywhere
  if (!session || session.user.deletedAt) return null;

  return session.user;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    return redirectToSignIn();
  }

  return user;
}
