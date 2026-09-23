import { headers } from "next/headers";
import { z } from "zod";

import { ActionErrorCode } from "@/lib/actions/action-error-code";
import type {
  ActionFieldErrors,
  ActionResult,
} from "@/lib/actions/create-safe-action";
import { getCurrentUser } from "@/lib/auth/current-user";

export type AuthenticatedActionContext = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  ipAddress: string | null;
};

export function createAuthenticatedSafeAction<TSchema extends z.ZodType, TResult>(
  options: { schema: TSchema },
  handler: (
    input: z.infer<TSchema>,
    context: AuthenticatedActionContext,
  ) => Promise<TResult>,
) {
  return async function action(
    rawInput: unknown,
  ): Promise<ActionResult<TResult>> {
    let userId: string | undefined;

    try {
      const user = await getCurrentUser();

      if (!user) {
        return {
          ok: false,
          error: {
            code: ActionErrorCode.UNAUTHORIZED,
            message: "You must be signed in.",
          },
        };
      }

      userId = user.id;
      const parsedInput = options.schema.safeParse(rawInput);

      if (!parsedInput.success) {
        return {
          ok: false,
          error: {
            code: ActionErrorCode.VALIDATION_ERROR,
            message: "Please fix the highlighted fields.",
            fieldErrors: parsedInput.error.flatten()
              .fieldErrors as ActionFieldErrors,
          },
        };
      }

      const requestHeaders = await headers();
      const forwardedFor = requestHeaders.get("x-forwarded-for");
      const ipAddress =
        forwardedFor?.split(",")[0]?.trim() ||
        requestHeaders.get("x-real-ip") ||
        null;

      return {
        ok: true,
        data: await handler(parsedInput.data, { user, ipAddress }),
      };
    } catch (error) {
      console.error("Authenticated action failed.", { error, userId });

      return {
        ok: false,
        error: {
          code: ActionErrorCode.SERVER_ERROR,
          message: "Something went wrong. Please try again.",
        },
      };
    }
  };
}
