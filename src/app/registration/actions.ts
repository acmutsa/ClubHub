"use server";

import { db } from "@/db";
import { userProfiles } from "@/db/schema";

import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { createUserProfileSchema } from "@/lib/validators/user-profile";

export const submitRegistrationAction = createAuthenticatedSafeAction(
  { schema: createUserProfileSchema },
  async (parsedInput, { user }) => {
    if (!user) {
      throw new Error("You must be signed in to submit registration.");
    }

    const profileValues = {
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      phoneNumber: parsedInput.phoneNumber,
      pronouns: parsedInput.pronouns,
      birthDate: parsedInput.birthDate,
      school: parsedInput.school,
      expectedGraduationDate: parsedInput.expectedGraduationDate,
      major: parsedInput.major,
      country: parsedInput.country,
      race: parsedInput.race,
      gender: parsedInput.gender,
      ethnicity: parsedInput.ethnicity,
      shirtSize: parsedInput.shirtSize,
      eventAnnouncementEmail: parsedInput.eventAnnouncementEmail,
      eventAnnouncementPhone: parsedInput.eventAnnouncementPhone,
      updatedAt: new Date(),
      deletedAt: null,
    };

    await db
      .insert(userProfiles)
      .values({ userId: user.id, ...profileValues })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: profileValues,
      });

    return { accepted: true };
  },
);
