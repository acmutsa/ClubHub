import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/index";
import { userProfiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function getCurrentUserSettingsProfile() {
  const currentUser = await requireCurrentUser();

  const [profile] = await db
    .select({
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      phoneNumber: userProfiles.phoneNumber,
      pronouns: userProfiles.pronouns,
      birthDate: userProfiles.birthDate,
      school: userProfiles.school,
      expectedGraduationDate: userProfiles.expectedGraduationDate,
      major: userProfiles.major,
      country: userProfiles.country,
      race: userProfiles.race,
      gender: userProfiles.gender,
      ethnicity: userProfiles.ethnicity,
      shirtSize: userProfiles.shirtSize,
      eventAnnouncementEmail: userProfiles.eventAnnouncementEmail,
      eventAnnouncementPhone: userProfiles.eventAnnouncementPhone,
    })
    .from(userProfiles)
    .where(and(eq(userProfiles.userId, currentUser.id), isNull(userProfiles.deletedAt)))
    .limit(1);

  return profile ?? null;
}

export type SettingsProfile = NonNullable<Awaited<ReturnType<typeof getCurrentUserSettingsProfile>>>;
