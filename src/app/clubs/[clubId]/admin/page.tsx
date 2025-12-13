import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { membership } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import isClubAdmin from "@/lib/membership";

export default async function Page({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  const user = session.user;
  if (!isClubAdmin(user.id, clubId)) {
    return <div>Unauthorized</div>;
  }

  return <div>Admin for {clubId}</div>;
}
