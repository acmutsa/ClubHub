import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { AccountCard } from "./components/account-card";
import { SettingsForm } from "./components/settings-form";
import { getCurrentUserSettingsProfile } from "./queries";

export default async function SettingsPage() {
  const [currentUser, profile] = await Promise.all([requireCurrentUser(), getCurrentUserSettingsProfile()]);

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
              {currentUser.image && <AvatarImage src={currentUser.image} alt="" />}
              <AvatarFallback className="text-3xl">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="max-w-full min-w-0">
              <p className="text-2xl leading-tight font-bold">{currentUser.name}</p>
              <p className="text-muted-foreground text-sm break-all">{currentUser.email}</p>
            </div>
          </CardContent>
        </Card>

        <SettingsForm profile={profile}>
          <AccountCard email={currentUser.email} />
        </SettingsForm>
      </div>
    </main>
  );
}
