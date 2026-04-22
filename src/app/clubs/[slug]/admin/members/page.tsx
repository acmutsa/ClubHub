import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { domain, baseURL } from "@/lib/url";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasClubPermission } from "@/lib/membership";
import { adminPermissions } from "@/lib/types/club-admin";

export default async function MemberPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const clubURL = `http://${slug}.${domain}`;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(`${baseURL}/sign-in`);
  }

  const user = session.user;

  const canManageRoles = await hasClubPermission(user.id, slug, adminPermissions.MANAGE_CLUB);

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                Members
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage and monitor your organizations members
              </p>
            </div>
            {canManageRoles && (
              <Link href={`${clubURL}/admin/members/new`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4">
        {/* <DataTable
          columns={columns}
          data={clubEvents}
          eventTypes={eventTypes}
        /> */}
      </div>
    </>
  );
}
