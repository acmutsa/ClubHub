"use server";

import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { OWNER_ROLE_NAME } from "@/constants/role-positions";
import { db } from "@/db/index";
import { clubMemberships, clubRoles } from "@/db/schema";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { idSchema } from "@/lib/validators/common";

const leaveClubFromProfileSchema = z.object({
  clubId: idSchema,
});

type LeaveClubFromProfileResult =
  | { status: "left" }
  | { status: "not_member" }
  | { status: "sole_owner" }
  | { status: "suspended" };

// A membership's role, matched on both clubId and roleId
const membershipRoleJoin = and(
  eq(clubRoles.clubId, clubMemberships.clubId),
  eq(clubRoles.id, clubMemberships.roleId),
);

// The Owner role is the club's system role named OWNER.
const isOwnerRole = and(eq(clubRoles.isSystem, true), eq(clubRoles.name, OWNER_ROLE_NAME));

// Leaves a club from /profile by soft-deleting the caller's own
export const leaveClubFromProfileAction = createAuthenticatedSafeAction(
  { schema: leaveClubFromProfileSchema },
  async ({ clubId }, context): Promise<LeaveClubFromProfileResult> => {
    const userId = context.user.id;

    const result = await db.transaction(async (tx): Promise<LeaveClubFromProfileResult> => {
      const [membership] = await tx
        .select({
          applicationStatus: clubMemberships.applicationStatus,
          isOwner: sql<boolean>`${isOwnerRole}`.mapWith(Boolean),
        })
        .from(clubMemberships)
        .innerJoin(clubRoles, membershipRoleJoin)
        .where(
          and(
            eq(clubMemberships.userId, userId),
            eq(clubMemberships.clubId, clubId),
            isNull(clubMemberships.deletedAt),
          ),
        )
        .limit(1);

      if (!membership) {
        return { status: "not_member" };
      }

      // Only an approved membership can leave
      if (membership.applicationStatus === "approved" && membership.isOwner) {
        const [{ otherOwners }] = await tx
          .select({ otherOwners: count() })
          .from(clubMemberships)
          .innerJoin(clubRoles, membershipRoleJoin)
          .where(
            and(
              eq(clubMemberships.clubId, clubId),
              ne(clubMemberships.userId, userId),
              isNull(clubMemberships.deletedAt),
              eq(clubMemberships.applicationStatus, "approved"),
              eq(clubMemberships.status, "active"),
              isOwnerRole,
            ),
          );

        if (otherOwners === 0) {
          return { status: "sole_owner" };
        }
      }

      const endedMemberships = await tx
        .update(clubMemberships)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(clubMemberships.userId, userId),
            eq(clubMemberships.clubId, clubId),
            isNull(clubMemberships.deletedAt),
            eq(clubMemberships.applicationStatus, "approved"),
          ),
        )
        .returning({ clubId: clubMemberships.clubId });

      if (endedMemberships.length > 0) {
        return { status: "left" };
      }

      // Nothing was updated: look up the caller's live row to report why
      const [liveMembership] = await tx
        .select({ applicationStatus: clubMemberships.applicationStatus })
        .from(clubMemberships)
        .where(
          and(
            eq(clubMemberships.userId, userId),
            eq(clubMemberships.clubId, clubId),
            isNull(clubMemberships.deletedAt),
          ),
        )
        .limit(1);

      if (liveMembership?.applicationStatus === "suspended") {
        // The row is left as is so the suspension sticks
        return { status: "suspended" };
      }

      // No live row, or a pending application. Withdrawing a pending application is a
      // separate flow, not this action, so it's reported as not_member for now.
      return { status: "not_member" };
    });

    if (result.status === "left") {
      revalidatePath("/profile");
      revalidatePath("/clubs");
    }

    return result;
  },
);
