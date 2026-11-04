import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/index";
import { user } from "@/db/auth-schema";
import { userProfiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";
import type { UpdateSettingsInput } from "./validators";

export async function getSettingsPageData() {
  const currentUser = await requireCurrentUser();

  const [row] = await db
    .select({
      name: user.name,
      email: user.email,
      image: user.image,
      profile: userProfiles,
    })
    .from(user)
    .leftJoin(
      userProfiles,
      and(eq(userProfiles.userId, user.id), isNull(userProfiles.deletedAt)),
    )
    .where(and(eq(user.id, currentUser.id), isNull(user.deletedAt)))
    .limit(1);

  if (!row) return null;
  return { ...row, profile: row.profile as UpdateSettingsInput | null };
}
