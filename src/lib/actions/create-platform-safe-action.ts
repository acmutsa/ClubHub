import { z } from "zod";

import { ActionErrorCode } from "@/lib/actions/action-error-code";
import type {
  ActionFieldErrors,
  ActionResult,
} from "@/lib/actions/create-safe-action";
import type { PlatformPermissionType } from "@/lib/auth/permissions";
import { requirePlatformContext } from "@/lib/platform-context/get-platform-context";

export class PlatformActionError extends Error {
  constructor(
    public readonly code: ActionErrorCode,
    message: string,
    public readonly fieldErrors?: ActionFieldErrors,
  ) {
    super(message);
    this.name = "PlatformActionError";
  }
}

export function platformActionError(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: ActionFieldErrors,
) {
  return new PlatformActionError(code, message, fieldErrors);
}

export function createPlatformSafeAction<TSchema extends z.ZodType, TResult>(
  options: { schema: TSchema; permission: PlatformPermissionType },
  handler: (
    input: z.infer<TSchema>,
    context: Awaited<ReturnType<typeof requirePlatformContext>>,
  ) => Promise<TResult>,
) {
  return async function action(
    rawInput: unknown,
  ): Promise<ActionResult<TResult>> {
    let userId: string | undefined;

    try {
      const context = await requirePlatformContext();
      userId = context.user.id;

      if (!context.hasPlatformPermission(options.permission)) {
        return {
          ok: false,
          error: {
            code: ActionErrorCode.FORBIDDEN,
            message: "You do not have permission to do this.",
          },
        };
      }

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

      return { ok: true, data: await handler(parsedInput.data, context) };
    } catch (error) {
      if (error instanceof PlatformActionError) {
        return {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            fieldErrors: error.fieldErrors,
          },
        };
      }

      console.error("Platform action failed.", {
        error,
        userId,
        permission: options.permission,
      });

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
