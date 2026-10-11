"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Shown when /profile fails to load. Never renders the raw error: the details stay
// in the server logs.
export default function ProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Your profile couldn&apos;t be loaded</h1>
          <p className="text-muted-foreground text-sm">
            Something went wrong on our side. Your account and clubs haven&apos;t been changed.
          </p>
        </div>
        <Button onClick={reset}>
          <RotateCw />
          Try again
        </Button>
      </div>
    </main>
  );
}
