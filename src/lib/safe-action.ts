import {
  createSafeActionClient,
  returnValidationErrors,
} from "next-safe-action";
import { auth } from "./auth";
import { headers } from "next/headers";
import { z } from "zod";

export const publicAction = createSafeActionClient();

export const authAction = publicAction.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    returnValidationErrors(z.null(), {
      _errors: ["Unauthorized (No User ID)"],
    });
  }
  return next({ ctx: { userId: session.user.id } });
});
