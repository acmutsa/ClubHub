"use server";

import { createSafeActionClient } from "next-safe-action";

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

    // Registration persistence is not wired up yet; validate the full payload before redirecting.
    void parsedInput;
    return { accepted: true };
  });
