import MemberTable from "@/components/shared/membership/member-table";
import { Button } from "@/components/ui/button";
import { getClubBySlug } from "@/lib/queries/club";
import { modifyBasePath } from "@/lib/routing/subdomain";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect, unauthorized } from "next/navigation";
import isClubAdmin from "@/lib/membership";
import { auth } from "@/lib/auth";
export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const club = await getClubBySlug(slug);
    const h = (await headers()).get("host") ?? "";
    if (!club) {
        return notFound();
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/sign-in");
    }
    const user = session?.user;
    const isAdmin = await isClubAdmin(user.id, slug);

    return (
        <div className="flex flex-col bg-background">
            <header className="mx-auto w-full max-w-7xl px-4 pt-12 pb-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/60 pb-8 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                            Members
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            See all of {club.name}'s Members and Officers.
                        </p>
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-8">
                <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                    <MemberTable isAdmin={isAdmin} clubId={club.id} />
                </div>
            </main>
        </div>
    );
}
