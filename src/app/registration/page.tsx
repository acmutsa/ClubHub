import RegistrationForm from "@/components/registration/registration-form";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getSafeCallbackUrl } from "@/lib/auth/sign-in-redirect";
import { getAppSurface } from "@/lib/club-context/get-club-context";

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, surface, user] = await Promise.all([
    searchParams,
    getAppSurface(),
    requireCurrentUser(),
  ]);
  const safeCallbackUrl = getSafeCallbackUrl(
    callbackUrl,
    surface === "landing" ? undefined : surface,
  );
  const returnUrl =
    safeCallbackUrl.startsWith("/registration")
      ? "/"
      : safeCallbackUrl;
  const [existingProfile] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(
      and(
        eq(userProfiles.userId, user.id),
        isNull(userProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (existingProfile) {
    redirect(returnUrl);
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Complete Your Registration
      </h1>

      <p className="text-muted-foreground">
        Tell us a little about yourself.
      </p>

      <RegistrationForm />
    </main>
  );
}