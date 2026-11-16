"use server";

import { and, eq, isNull, ne} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/index";
import { clubMemberships} from "@/db/schema";
import { ActionErrorCode } from "@/constants/action-error-code";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { actionError } from "@/lib/actions/create-safe-action";
import { deleteClubMembershipSchema } from "@/lib/validators/club-membership";


export const leaveClubFromProfileAction = createAuthenticatedSafeAction(
  { schema: deleteClubMembershipSchema },

  async ({ clubId }, context) => {

    await db.transaction(async (transaction) => {

      const membership = await transaction.query.clubMemberships.findFirst({
        where: and(
          eq(clubMemberships.userId, context.user.id), 
          eq(clubMemberships.clubId, clubId), 
          isNull(clubMemberships.deletedAt)
        ),
        with: { role: true },
      });

      if (!membership) {
        throw actionError(ActionErrorCode.NOT_FOUND, "Membership was not found.");
      }

      if (membership.applicationStatus === "suspended") {
        throw actionError(ActionErrorCode.FORBIDDEN, "Your membership in this club is suspended. Contact a club officer.");
      }

      if (membership.applicationStatus !== "approved") {
        throw actionError(ActionErrorCode.FORBIDDEN, "Your membership must be approved by a club administrator.");
      }

      if (membership.role.isSystem && membership.role.name === "OWNER") {
        
        const owners = await transaction.$count(clubMemberships,
          and(
              eq(clubMemberships.clubId, clubId),
              ne(clubMemberships.userId, context.user.id),
              isNull(clubMemberships.deletedAt),
              eq(clubMemberships.applicationStatus, "approved"),
              eq(clubMemberships.status, "active"),
              eq(clubMemberships.roleId, membership.roleId),
          )
        );

        if (owners === 0) {
          throw actionError(ActionErrorCode.CONFLICT, "You're the only owner of this club. Transfer ownership before leaving this club.");
        }
      }

      await transaction.update(clubMemberships).set({ deletedAt: new Date() }).where(
        and(
          eq(clubMemberships.userId, context.user.id), 
          eq(clubMemberships.clubId, clubId), 
          isNull(clubMemberships.deletedAt), 
          eq(clubMemberships.applicationStatus, "approved")
        ),
      );

    });

    revalidatePath("/profile");
    revalidatePath("/clubs");

  });