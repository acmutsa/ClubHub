import { getClubContext, requireClubContext } from "@/lib/club-context/get-club-context";

export async function getAuthContext() {
  return getClubContext();
}

export async function requireAuthContext() {
  return requireClubContext();
}

export type AuthContext = NonNullable<
  Awaited<ReturnType<typeof getAuthContext>>
>;
