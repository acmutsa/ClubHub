import { z } from "zod";

import { ActionErrorCode } from "@/lib/actions/action-error-code";
import type { ClubPermissionType } from "@/lib/auth/permissions";
import {
  getCurrentClub,
  getOptionalClubContext,
  type ClubContext,
} from "@/lib/club-context/get-club-context";

export type ActionFieldErrors = Partial<Record<string, string[]>>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: ActionErrorCode;
        message: string;
        fieldErrors?: ActionFieldErrors;
      };
    };

export class SafeActionError extends Error {
  constructor(
    public readonly code: Exclude<
      ActionErrorCode,
      ActionErrorCode.VALIDATION_ERROR | ActionErrorCode.UNAUTHORIZED
    >,
    message: string,
    public readonly fieldErrors?: ActionFieldErrors,
  ) {
    super(message);
    this.name = "SafeActionError";
  }
}

export type ActionContext = Pick<
  ClubContext,
  "user" | "club" | "clubId" | "membership" | "permissions" | "ipAddress"
>;

type CreateSafeActionOptions<TSchema extends z.ZodType> = {
  schema: TSchema;
  permission?: ClubPermissionType;
};

export function actionError(
  code: ConstructorParameters<typeof SafeActionError>[0],
  message: string,
  fieldErrors?: ActionFieldErrors,
) {
  return new SafeActionError(code, message, fieldErrors);
}

async function getActionContext(): Promise<ActionContext | null> {
  let context: Awaited<ReturnType<typeof getOptionalClubContext>>;

  try {
    context = await getOptionalClubContext();
  } catch {
    const club = await getCurrentClub();

    throw actionError(
      club ? ActionErrorCode.FORBIDDEN : ActionErrorCode.NOT_FOUND,
      club ? "Club membership required." : "Club was not found.",
    );
  }

  if (!context) return null;

  return context;
}

export function createSafeAction<TSchema extends z.ZodType, TResult>(
  options: CreateSafeActionOptions<TSchema>,
  handler: (input: z.infer<TSchema>, context: ActionContext) => Promise<TResult>,
) {
  return async function action(
    rawInput: unknown,
  ): Promise<ActionResult<TResult>> {
    let context: ActionContext | null = null;

    try {
      context = await getActionContext();

      if (!context) {
        return {
          ok: false,
          error: {
            code: ActionErrorCode.UNAUTHORIZED,
            message: "You must be signed in.",
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

      // Accepted now so action call sites will not change when permissions land.
      // Enforcement is intentionally deferred until the permission model exists.
      void options.permission;

      const data = await handler(parsedInput.data, context);

      return { ok: true, data };
    } catch (error) {
      if (error instanceof SafeActionError) {
        return {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            fieldErrors: error.fieldErrors,
          },
        };
      }

      console.error("Safe action failed with an unexpected server error.", {
        error,
        userId: context?.user.id,
        clubId: context?.clubId,
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
