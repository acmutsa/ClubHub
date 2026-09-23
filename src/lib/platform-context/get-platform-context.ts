import { forbidden } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { PlatformPermissionType } from "@/lib/auth/permissions";
import { redirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { getAppSurface } from "@/lib/club-context/get-club-context";

async function buildPlatformContext(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
) {
  if ((await getAppSurface()) !== "platform") {
    forbidden();
  }

  const platformRole =
    (await db.query.platformRoles.findFirst({
      where: (roles, { eq }) => eq(roles.userId, user.id),
    })) ?? null;

  if (!platformRole || platformRole.deletedAt) {
    forbidden();
  }

  const platformPermissions = platformRole.permissions as PlatformPermissionType[];

  return {
    user,
    platformRole,
    platformPermissions,

    hasPlatformPermission(permission: PlatformPermissionType) {
      return platformPermissions.includes(permission);
    },

    hasPlatformPermissions(requiredPermissions: PlatformPermissionType[]) {
      return requiredPermissions.every((permission) =>
        platformPermissions.includes(permission),
      );
    },

    requirePlatformPermission(permission: PlatformPermissionType) {
      if (!platformPermissions.includes(permission)) {
        forbidden();
      }

      return user;
    },
  };
}

export const getPlatformContext = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirectToSignIn();
  }

  return buildPlatformContext(user);
});

export async function requirePlatformContext() {
  return getPlatformContext();
}

export type PlatformContext = Awaited<ReturnType<typeof getPlatformContext>>;
