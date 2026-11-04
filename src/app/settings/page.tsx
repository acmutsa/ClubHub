import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DeletedAccountSignOut } from "@/app/profile/deleted-account-sign-out";
import { SettingsForm } from "./components/settings-form";
import { getSettingsPageData } from "./queries";

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  if (!data) return <DeletedAccountSignOut />;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href="/profile" className="hover:text-foreground transition-colors">
          Profile
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-foreground">Settings</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Card className="w-full lg:sticky lg:top-6 lg:w-80 lg:shrink-0">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-28">
              {data.image && <AvatarImage src={data.image} alt="" />}
              <AvatarFallback className="text-3xl">{data.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="max-w-full min-w-0">
              <p className="text-2xl leading-tight font-bold">{data.name}</p>
              <p className="text-muted-foreground text-sm break-all">{data.email}</p>
            </div>
          </CardContent>
        </Card>

        <SettingsForm profile={data.profile} />
      </div>
    </main>
  );
}
