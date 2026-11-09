"use server";

import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { OWNER_ROLE_NAME } from "@/constants/role-positions";
import { db } from "@/db/index";
import { clubMemberships, clubRoles } from "@/db/schema";
import { ActionErrorCode } from "@/constants/action-error-code";
import { createAuthenticatedSafeAction } from "@/lib/actions/create-authenticated-safe-action";
import { actionError } from "@/lib/actions/create-safe-action";
import { deleteClubMembershipSchema } from "@/lib/validators/club-membership";

const membershipRoleJoin = and(
  eq(clubRoles.clubId, clubMemberships.clubId),
  eq(clubRoles.id, clubMemberships.roleId),
);

const isOwnerRole = and(eq(clubRoles.isSystem, true), eq(clubRoles.name, OWNER_ROLE_NAME));

export const leaveClubFromProfileAction = createAuthenticatedSafeAction(
  { schema: deleteClubMembershipSchema },
  async ({ clubId }, context) => {
    const userId = context.user.id;

    await db.transaction(async (tx) => {
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

      if (membership?.applicationStatus === "suspended") {
        throw actionError(
          ActionErrorCode.FORBIDDEN,
          "Your membership in this club is suspended. Contact a club officer.",
        );
      }

      if (membership?.applicationStatus !== "approved") {
        throw actionError(ActionErrorCode.NOT_FOUND, "You're no longer a member of this club.");
      }

      if (membership.isOwner) {
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
          throw actionError(
            ActionErrorCode.CONFLICT,
            "You're the only owner of this club. Transfer ownership before leaving.",
          );
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

      if (endedMemberships.length === 0) {
        throw actionError(ActionErrorCode.NOT_FOUND, "You're no longer a member of this club.");
      }
    });

    revalidatePath("/profile");
    revalidatePath("/clubs");
  },
);
