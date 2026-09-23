import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { getOptionalClubContext } from "@/lib/club-context/get-club-context";

export async function getAuthContext() {
  return getOptionalClubContext();
}

export async function requireAuthContext() {
  const context = await getAuthContext();

  if (!context) {
    return redirectToSignIn();
  }

  return context;
}

export type AuthContext = NonNullable<
  Awaited<ReturnType<typeof getAuthContext>>
>;
