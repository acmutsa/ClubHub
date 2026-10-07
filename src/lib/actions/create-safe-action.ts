import { z } from "zod";

import { ActionErrorCode } from "@/lib/actions/action-error-code";
import type { Permission } from "@/constants/permissions";
import {
  getCurrentClub,
  getOptionalClubContext,
  type ClubContext,
} from "@/lib/club-context/get-club-context";
import { getCurrentUser } from "@/lib/auth/current-user";

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
  "user" | "club" | "clubId" | "membership" | "permissions" | "ipAddress" | "hasPermission" | "requirePermission"
>;

type CreateSafeActionOptions<TSchema extends z.ZodType> = {
  schema: TSchema;
  permission?: Permission;
};

export function actionError(
  code: ConstructorParameters<typeof SafeActionError>[0],
  message: string,
  fieldErrors?: ActionFieldErrors,
) {
  return new SafeActionError(code, message, fieldErrors);
}

async function getActionContext(): Promise<ActionContext | null> {
  if (!(await getCurrentUser())) return null;
  if (!(await getCurrentClub())) throw actionError(ActionErrorCode.NOT_FOUND, "Club was not found.");
  const context = await getOptionalClubContext();
  if (!context) throw actionError(ActionErrorCode.FORBIDDEN, "Club membership required.");
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

      if (options.permission && !context.hasPermission(options.permission)) {
        throw actionError(ActionErrorCode.FORBIDDEN, "You do not have permission to do this.");
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
