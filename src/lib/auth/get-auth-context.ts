import { getOptionalClubContext, requireClubContext } from "@/lib/club-context/get-club-context";

export async function getAuthContext() {
  return getOptionalClubContext();
}

export async function requireAuthContext() {
  return requireClubContext();
}

export type AuthContext = NonNullable<
  Awaited<ReturnType<typeof getAuthContext>>
>;
