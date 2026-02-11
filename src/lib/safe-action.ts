import {
  createSafeActionClient,
  returnValidationErrors,
} from "next-safe-action";
import { auth } from "./auth";
import { headers } from "next/headers";
import { z } from "zod";
import isClubAdmin from "./membership";

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

export const clubAdminAction = authAction
  .bindArgsSchemas<[clubId: z.ZodString]>([z.string()])
  .use(async ({ next, ctx, bindArgsClientInputs: [clubId] }) => {
    const parsedClubId = clubId as string;
    if (!(await isClubAdmin(ctx.userId, parsedClubId))) {
      returnValidationErrors(z.null(), {
        _errors: ["Forbidden (Not a Club Admin)"],
      });
    }
    return next({ ctx: { ...ctx, clubId: parsedClubId } });
  });
