import { baseURL } from "@/lib/url";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { hasClubPermission } from "@/lib/membership";
import { adminPermissions } from "@/lib/types/club-admin";
import NewRoleForm from "@/components/clubs/admin/members/new-role-form";

export default async function NewRolePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(`${baseURL}/sign-in`);
  }

  const user = session.user;

  const canManageRoles = await hasClubPermission(user.id, slug, adminPermissions.MANAGE_CLUB);
  if (!canManageRoles) return unauthorized;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card">
            <div className="mx-auto max-w-7xl p-4">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-balance">
                    Create New Role
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                    Fill in the details below to create a new role for your club.
                    </p>
                </div>
                </div>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-8">
                <NewRoleForm
                    slug={slug}
                />
            </div>
        </div>
    </div>
  );
}
