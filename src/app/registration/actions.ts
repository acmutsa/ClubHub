"use server";

import { createSafeActionClient } from "next-safe-action";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";

import { getCurrentUser } from "@/lib/auth/current-user";
import { registrationFormSchema } from "@/components/registration/registration-schema";

const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("Registration submission failed.", error);
    return "Could not complete registration. Please try again.";
  },
});

export const submitRegistrationAction = actionClient
  .inputSchema(registrationFormSchema)
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("You must be signed in to submit registration.");
    }

    if (
      user.email &&
      parsedInput.account.email.toLocaleLowerCase() !== user.email.toLocaleLowerCase()
    ) {
      throw new Error("Registration email must match your signed-in account.");
    }

    const profileValues = {
      firstName: parsedInput.account.firstName,
      lastName: parsedInput.account.lastName,
      phoneNumber: parsedInput.phoneNumber,
      pronouns: parsedInput.pronouns,
      birthDate: new Date(`${parsedInput.birthDate}T00:00:00.000Z`),
      school: "The University of Texas at San Antonio",
      expectedGraduationDate: new Date(
        `${parsedInput.expectedGraduationDate}T00:00:00.000Z`,
      ),
      major: parsedInput.major,
      country: parsedInput.country,
      race: [parsedInput.race],
      gender: parsedInput.gender,
      ethnicity: parsedInput.ethnicity,
      shirtSize: parsedInput.shirtSize,
      eventAnnouncementEmail: parsedInput.emailReminder,
      eventAnnouncementPhone:
        parsedInput.phoneReminder || parsedInput.smsReminder,
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
  });
