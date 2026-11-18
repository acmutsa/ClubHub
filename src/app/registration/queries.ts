import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { user } from "@/db/auth-schema";

export async function hasActiveRegistrationProfile(userId: string) {
  const [existingProfile] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(
      and(
        eq(userProfiles.userId, userId),
        isNull(userProfiles.deletedAt),
      ),
    )
    .limit(1);

  return Boolean(existingProfile);
}

export async function getUserNames(userId: string) {
  const [account] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!account?.name.trim()) return undefined;

  const [firstName, ...lastNameParts] = account.name.trim().split(/\s+/);
  return { firstName, lastName: lastNameParts.join(" ") };
}
