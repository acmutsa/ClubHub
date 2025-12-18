import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <h2>Club {clubId}</h2>
      {session?.user ? (
        <>
          <p>Session: {session.user?.email}</p>
        </>
      ) : (
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      )}
    </div>
  );
}
