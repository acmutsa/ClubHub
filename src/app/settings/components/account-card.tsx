import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountCard({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground min-w-0 text-sm break-all">{email}</p>
          {/* TODO: enable once a change-email flow exists */}
          <Button type="button" variant="outline" className="h-11 sm:h-9" disabled>
            <Mail />
            Change email
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">Password</p>
          <Button asChild variant="outline" className="h-11 sm:h-9">
            <Link href="/auth/forgot-password">
              <KeyRound />
              Change password
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
