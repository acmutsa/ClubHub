import RegistrationForm from "@/components/registration/registration-form";
import { getSafeCallbackUrl } from "@/lib/auth/sign-in-redirect";
import { getAppSurface } from "@/lib/club-context/get-club-context";

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, surface] = await Promise.all([
    searchParams,
    getAppSurface(),
  ]);
  const safeCallbackUrl = getSafeCallbackUrl(
    callbackUrl,
    surface === "landing" ? undefined : surface,
  );
  const returnUrl =
    safeCallbackUrl === "/" || safeCallbackUrl.startsWith("/registration")
      ? "/clubs"
      : safeCallbackUrl;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Complete Your Registration
      </h1>

      <p className="text-muted-foreground">
        Tell us a little about yourself.
      </p>

      <RegistrationForm callbackUrl={returnUrl} />
    </main>
  );
}