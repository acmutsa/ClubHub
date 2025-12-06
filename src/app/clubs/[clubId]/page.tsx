import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "@/components/sign-out-button";

export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <h2>Club {clubId}</h2>
      <p>Session: {session.user?.email}</p>
      <SignOutButton />
    </div>
  );
}
